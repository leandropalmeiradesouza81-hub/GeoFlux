/**
 * Fraud Detection & Security Service
 * 
 * Central Anti-Fraude e Anti-Gaming do GeoFlux:
 * 1. Hardware Fingerprinting & Bloqueio Sessão Dupla.
 * 2. Mirroring Detection (<5m distância em comboios para simular duas viagens no mesmo carro).
 * 3. Sensor Cross-checking (Acelerômetro VS GPS).
 * 4. Saturation Rule (Impede lucros na mesma rua no período de 24h).
 */

import { logger } from '../utils/logger.js';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

class FraudDetectionService {
  
  /**
   * 1. Hardware Fingerprinting (Validação de Dispositivo)
   */
  async validateDeviceAndSession(driverId, incomingDeviceId) {
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    
    // Bloqueado pelo admin?
    if (driver.status === 'BLOCKED') throw new Error('Driver is banned.');

    // Vínculo inicial de aparelho
    if (!driver.deviceId) {
      await prisma.driver.update({ where: { id: driverId }, data: { deviceId: incomingDeviceId } });
      return true;
    }

    // Se o aparelho é diferente do mapeado
    if (driver.deviceId !== incomingDeviceId) {
      logger.warn(`🚨 Anti-Fraude: Motorista ${driverId} tentou usar hardware não autorizado (${incomingDeviceId})`);
      throw new Error('Hardware mismatch. Dispositivo não autorizado. Contate o suporte.');
    }

    // Bloqueio de Sessão Dupla 
    const activeSessionKey = `active_session:${driverId}`;
    const inUse = await redis.get(activeSessionKey);
    // Se há registro mas de outro momento/aparelho. Atualizar ou bloquear?
    // Aqui usamos uma margem. Se o ping do active for < 2 minutos atrás, bloquear a abertura paralela.
    const now = Date.now();
    if (inUse && (now - parseInt(inUse)) < 120000) {
      throw new Error('Sessão dupla detectada. Você já possui uma corrida ativa em outro aparelho.');
    }

    // Atualiza o heartbeat da sessão para bloquear duplos simultâneos
    await redis.set(activeSessionKey, Date.now(), 'EX', 120);
    return true;
  }

  /**
   * 2. Detecção de Espelhamento (Dois motoristas no mesmo carro)
   * Analisa num buffer R-Tree ou Redis Geo se existem outros motoristas quase na mesma coordenada ao mesmo tempo
   */
  async checkMirroring(driverId, lat, lon) {
    const geoKey = `driver_locations_live`;
    
    // Registrar a localização do usuário com expiração de 60s
    await redis.geoadd(geoKey, lon, lat, driverId);

    // Buscar quem está num raio de 5 metros neste exato segundo (Simulação do cenário "dois celulares")
    const neighbors = await redis.georadius(geoKey, lon, lat, 5, 'm', 'WITHDIST');

    for (const nb of neighbors) {
      const neighborId = nb[0];
      const distance = nb[1];

      if (neighborId !== driverId && distance < 5) {
        // Motorista detectado a menos de 5 metros nos mesmos 60 segundos
        // Registrar ocorrência de Proxy/Mirroring num counter
        const mirrorKey = `mirroring_strike:${driverId}:${neighborId}`;
        const strikes = await redis.incr(mirrorKey);
        await redis.expire(mirrorKey, 120); // 2 minutos para acumular strikes

        // Se durar mais de 3 requisições coladas (60s aprox)
        if (strikes >= 3) {
           await this.banCollaborators(driverId, neighborId, 'Tentativa de Fraude de Espelhamento de Hardware');
           throw new Error('Mirroring policy violation');
        }
      }
    }
    return true;
  }

  /**
   * 3. Cross-Check de Sensores Físicos
   * Rejeitar dados onde o GPS é de alta velocidade (>5m/s = 18km/h) mas o acelerômetro indica inércia de gravidade estática (mock GPS).
   */
  checkPhysicalSensors(framesBatch) {
    let strikes = 0;
    for (const frame of framesBatch) {
       if (frame.speed > 5.0 && (frame.accelerometerG > 0.98 && frame.accelerometerG < 1.02)) {
         strikes++;
       }
    }
    // Se mais de 30% do lote de imagens apresenta essa falsificação:
    if (strikes > (framesBatch.length * 0.3)) {
      logger.warn(`🚨 Anti-Fraude: Simulação de Movimento Acelerado / Emulator Detectado.`);
      return false; // Rejeitar lote inteiro
    }
    return true;
  }

  /**
   * 4. Saturação Diária (Bloqueio de ganho em rota circular para farmar dinheiro na mesma rua)
   */
  async checkTileSaturation(driverId, tileId) {
    const cacheKey = `driver_tile_24h:${driverId}:${tileId}`;
    const visited = await redis.get(cacheKey);

    if (visited) {
      return false; // Rua já invalidada financeiramente por 24h pro motorista
    } else {
      // Invalida a rua por 24 horas (86400 secs)
      await redis.set(cacheKey, 'mapped', 'EX', 86400);
      return true; // É um KM Fresco pra ele
    }
  }

  async banCollaborators(driverIdA, driverIdB, reason) {
    logger.error(`🚫 BANIMENTO APLICADO: Motoristas ${driverIdA} e ${driverIdB}. Razão: ${reason}`);
    
    await prisma.driver.updateMany({
      where: { id: { in: [driverIdA, driverIdB] } },
      data: { status: 'BLOCKED' }
    });
  }
}

export const fraudDetectionService = new FraudDetectionService();
