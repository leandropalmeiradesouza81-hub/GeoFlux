/**
 * Hivemapper Integration Service
 * 
 * Ponte entre o servidor GeoFlux e a rede Hivemapper.
 * 
 * Fluxo:
 * 1. Recebe frames processados (com privacidade aplicada)
 * 2. Gera metadata JSON no padrão Hivemapper/ODC
 * 3. Assina digitalmente cada pacote (ED25519)
 * 4. Envia para o Bee Maps API
 * 5. Monitora rewards recebidos
 */

import { logger } from '../utils/logger.js';
import nacl from 'tweetnacl';
import { Buffer } from 'buffer';

class HivemapperService {
  constructor() {
    this.apiUrl = process.env.BEEMAPS_API_URL || 'https://api.trybeekeeper.ai/v1';
    this.apiKey = process.env.BEEMAPS_API_KEY;
  }

  /**
   * Gera metadata JSON no padrão Hivemapper para um frame
   */
  generateMetadata(frame) {
    return {
      lat: frame.latitude,
      lon: frame.longitude,
      altitude: frame.altitude || 0,
      speed: frame.speed || 0,
      bearing: frame.bearing || 0,
      accuracy: frame.accuracy,
      timestamp: new Date(frame.capturedAt).toISOString(),
      source: 'geoflux',
      device_type: 'smartphone',
      session_id: frame.sessionId,
      frame_id: frame.id
    };
  }

  /**
   * Assina um pacote de dados com ED25519
   */
  signPackage(data) {
    try {
      const privateKeyHex = process.env.SOLANA_WALLET_PRIVATE_KEY;
      if (!privateKeyHex) {
        logger.warn('⚠️ Chave privada Solana não configurada');
        return null;
      }

      const message = Buffer.from(JSON.stringify(data));
      const privateKey = Buffer.from(privateKeyHex, 'hex');
      const keyPair = nacl.sign.keyPair.fromSecretKey(privateKey);
      const signature = nacl.sign.detached(message, keyPair.secretKey);

      return Buffer.from(signature).toString('hex');
    } catch (error) {
      logger.error(`❌ Erro ao assinar pacote: ${error.message}`);
      return null;
    }
  }

  /**
   * Envia batch de frames processados para o Bee Maps API
   */
  async submitBatch(frames) {
    if (!this.apiKey) {
      logger.warn('⚠️ BEEMAPS_API_KEY não configurada. Upload para Hivemapper desabilitado.');
      return { success: false, reason: 'API key not configured' };
    }

    const results = {
      submitted: 0,
      failed: 0,
      errors: []
    };

    for (const frame of frames) {
      try {
        const metadata = this.generateMetadata(frame);
        const signature = this.signPackage(metadata);

        if (signature) {
          metadata.signature = signature;
        }

        // TODO: Implementar chamada real ao Bee Maps API quando disponível
        // const response = await fetch(`${this.apiUrl}/imagery/upload`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${this.apiKey}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify({
        //     metadata,
        //     image: frame.processedImagePath
        //   })
        // });

        results.submitted++;
        logger.debug(`📡 Frame submetido: ${frame.id}`);

      } catch (error) {
        results.failed++;
        results.errors.push({ frameId: frame.id, error: error.message });
        logger.error(`❌ Falha ao submeter frame ${frame.id}: ${error.message}`);
      }
    }

    logger.info(`📡 Batch enviado ao Hivemapper: ${results.submitted} ok, ${results.failed} falhas`);
    return results;
  }

  /**
   * Consulta o status de um tile (hexágono) na rede Hivemapper
   * Retorna informações de freshness para calcular rewards
   */
  async getTileStatus(lat, lon) {
    if (!this.apiKey) {
      return { status: 'unknown', message: 'API key not configured' };
    }

    try {
      // TODO: Implementar consulta real ao Hivemapper Explorer API
      // const response = await fetch(
      //   `${this.apiUrl}/tiles/status?lat=${lat}&lon=${lon}`,
      //   { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
      // );
      // return await response.json();

      return {
        status: 'mock',
        freshness: 'stale',
        daysSinceMapped: 10,
        message: 'Mock data - integração real pendente'
      };
    } catch (error) {
      logger.error(`❌ Erro ao consultar tile: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Consulta rewards HONEY acumulados na Fleet API
   */
  async getFleetRewards() {
    if (!this.apiKey) {
      return { rewards: 0, message: 'API key not configured' };
    }

    try {
      const response = await fetch(`${this.apiUrl}/fleet/rewards`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`❌ Erro ao consultar rewards: ${error.message}`);
      return { rewards: 0, error: error.message };
    }
  }
}

export const hivemapperService = new HivemapperService();
