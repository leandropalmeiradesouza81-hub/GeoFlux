import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { integrationService } from '../services/integrationService.js';

const router = express.Router();

// Simular IA de Detecção
const mockAIObjects = [
  "Placa Pare Identificada",
  "Iluminação de Rua OK",
  "Lâmpada Queimada Detectada",
  "Buraco na Via (Grave)",
  "Semáforo em Operação",
  "Faixa de Pedestre Apagada",
  "Placa de Velocidade (60km/h)"
];

router.post('/upload', async (req, res) => {
  try {
    const { latitude, longitude, timestamp, image } = req.body;
    const frameId = uuidv4();
    
    // 1. IA Filter (GeoFlux Local)
    const detections = [];
    if (Math.random() > 0.4) {
      detections.push(mockAIObjects[Math.floor(Math.random() * mockAIObjects.length)]);
    }
    
    // 2. Multi-Relay Integration (Hivemapper, Mapillary, NATIX)
    const integrationResults = await integrationService.relayData({
      id: frameId,
      latitude,
      longitude,
      timestamp,
      image
    });

    res.json({
      success: true,
      frameId,
      detections,
      integrations: integrationResults,
      message: "Frame processado e distribuído para Hivemapper, Mapillary e NATIX"
    });

  } catch (error) {
    console.error("Frame upload error:", error);
    res.status(500).json({ success: false, message: "Erro ao processar frame" });
  }
});

export default router;
