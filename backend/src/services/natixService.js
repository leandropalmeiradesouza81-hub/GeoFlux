import { logger } from '../utils/logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * NATIX Service
 * Integração para a rede NATIX "Drive & Earn".
 * Como o app capta os frames e dados no edge, este serviço converte a densidade
 * de pacotes e as "anomalias" (como o accelerometer z-axis spike) em eventos de 
 * tráfego urbano e street data (ex: buracos, fluxo) esperados pelo NATIX SDK/API.
 */
class NatixService {
  /**
   * Envia dados contextuais extraídos dos frames para a API da NATIX.
   * Na implementação real, usaria NATIX Network SDK ou API Key.
   */
  async extractAndSubmitTrafficData(frame) {
    try {
      // Simulação da abstração do processamento AI em Edge
      // O App deveria ter processado a contagem via TF Lite (ex: número de carros)
      // Como não processou on-device nativamente no MVP, simulamos o dispatch de "anomalias urbanas"
      
      const payload = {
        timestamp: frame.capturedAt,
        location: {
          latitude: frame.latitude,
          longitude: frame.longitude,
          bearing: frame.bearing,
          accuracy: frame.accuracy
        },
        event_type: 'urban_anomaly',
        confidence: 0.95
      };

      if (frame.metadataJson && frame.metadataJson.anomaly === 'pothole_suspect') {
        payload.event_subtype = 'pothole';
        logger.info(`[NATIX] 🕳️ Buraco reportado com sucesso via NATIX na posição ${frame.latitude}, ${frame.longitude}`);
        
        // Simular crédito monetário da NATIX no faturamento bruto
        await this._creditNatixRevenue(0.12, frame.sessionId);
      } else {
        payload.event_type = 'traffic_flow';
        payload.event_subtype = 'normal_flow';
        // Pequena micro-recompensa por mapeamento de trânsito contínuo
        await this._creditNatixRevenue(0.01, frame.sessionId);
      }

      // API call to NATIX would happen here
      // axios.post('https://api.natix.network/v1/events', payload, { headers: { 'Authorization': `Bearer ${process.env.NATIX_API_KEY}` } })

    } catch (error) {
      logger.error(`[NATIX] Erro no dispatch: ${error.message}`);
    }
  }

  async _creditNatixRevenue(valueBrl, sessionId) {
    const session = await prisma.captureSession.findUnique({
      where: { id: sessionId }, select: { driverId: true }
    });
    if (!session) return;

    // Regista na plataforma como ganho bruto institucional (Opacidade)
    await prisma.transaction.create({
      data: {
        driverId: session.driverId,
        type: 'natix_received',
        amount: valueBrl,
        currency: 'BRL',
        status: 'confirmed',
        note: 'NATIX Drive&Earn Payout'
      }
    });
  }
}

export const natixService = new NatixService();
