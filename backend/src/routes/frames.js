import express from 'express';
import { v4 as uuidv4 } from 'uuid';

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
    
    // Gerar ID do frame
    const frameId = uuidv4();
    
    // Simular processamento de IA
    const detections = [];
    if (Math.random() > 0.4) {
      detections.push(mockAIObjects[Math.floor(Math.random() * mockAIObjects.length)]);
    }
    
    console.log(`[AI SERVICE] Frame ${frameId.substr(0,8)} recebido em ${latitude}, ${longitude}`);
    if (detections.length > 0) {
      console.log(`[AI DETECTED] ${detections.join(', ')}`);
    }

    res.json({
      success: true,
      frameId,
      detections,
      message: "Frame processado pela IA GeoFlux com sucesso"
    });

  } catch (error) {
    console.error("Frame upload error:", error);
    res.status(500).json({ success: false, message: "Erro ao processar frame" });
  }
});

export default router;
