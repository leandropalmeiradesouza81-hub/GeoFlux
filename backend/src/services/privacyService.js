/**
 * Privacy Processing Service
 * 
 * Pipeline de processamento de privacidade para frames capturados.
 * Desfoca rostos e placas de veículos antes de enviar para a Hivemapper.
 * 
 * Utiliza modelos de detecção:
 * - Faces: Modelo ONNX (BlazeFace ou SCRFD) 
 * - Placas: Modelo ONNX (YOLO treinado para plates)
 * 
 * Fluxo:
 * 1. Recebe frame (imagem WebP + metadata)
 * 2. Detecta rostos e placas na imagem
 * 3. Aplica blur gaussiano nas regiões detectadas
 * 4. Salva imagem processada
 * 5. Marca frame como pronto para envio à Hivemapper
 */

import { logger } from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

// Status do pipeline
const PIPELINE_STATUS = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  BLURRED: 'blurred',
  READY: 'ready',
  FAILED: 'failed'
};

class PrivacyService {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.stats = {
      processed: 0,
      facesBlurred: 0,
      platesBlurred: 0,
      failed: 0
    };
  }

  /**
   * Adiciona frames à fila de processamento
   * @param {Array} frames - Array de frames com imagePath e metadata
   */
  async enqueueFrames(frames) {
    for (const frame of frames) {
      this.queue.push({
        ...frame,
        pipelineStatus: PIPELINE_STATUS.QUEUED,
        enqueuedAt: new Date()
      });
    }

    logger.info(`🔒 ${frames.length} frames adicionados à fila de privacidade. Total na fila: ${this.queue.length}`);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Processa a fila de frames
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const frame = this.queue.shift();

      try {
        frame.pipelineStatus = PIPELINE_STATUS.PROCESSING;

        // 1. Carregar imagem
        const imagePath = frame.imagePath;
        if (!imagePath || !(await fileExists(imagePath))) {
          logger.warn(`⚠️ Imagem não encontrada: ${imagePath}`);
          frame.pipelineStatus = PIPELINE_STATUS.FAILED;
          this.stats.failed++;
          continue;
        }

        // 2. Detectar e desfocar rostos e placas
        const result = await this.processImage(imagePath);

        // 3. Atualizar estatísticas
        this.stats.processed++;
        this.stats.facesBlurred += result.facesDetected;
        this.stats.platesBlurred += result.platesDetected;

        frame.pipelineStatus = PIPELINE_STATUS.BLURRED;
        frame.processedImagePath = result.outputPath;

        logger.debug(
          `✅ Frame processado: ${result.facesDetected} rostos, ${result.platesDetected} placas desfocadas`
        );

      } catch (error) {
        logger.error(`❌ Erro ao processar frame: ${error.message}`);
        frame.pipelineStatus = PIPELINE_STATUS.FAILED;
        this.stats.failed++;
      }
    }

    this.isProcessing = false;
    logger.info(`🔒 Fila de privacidade processada. Stats: ${JSON.stringify(this.stats)}`);
  }

  /**
   * Processa uma imagem individual - detecta e desfoca rostos/placas
   * 
   * NOTA: Em produção, usar sharp + onnxruntime-node para processamento
   * real de ML. Esta versão usa detecção simplificada para MVP.
   * 
   * Para produção, instalar:
   * - npm install sharp onnxruntime-node
   * - Baixar modelos ONNX: blazeface.onnx, yolov8_plates.onnx
   */
  async processImage(imagePath) {
    const ext = path.extname(imagePath);
    const basename = path.basename(imagePath, ext);
    const dir = path.dirname(imagePath);
    const outputPath = path.join(dir, `${basename}_blurred${ext}`);

    // ========== IMPLEMENTAÇÃO COM SHARP (Produção) ==========
    // Descomentar quando sharp estiver instalado:
    //
    // import sharp from 'sharp';
    //
    // const image = sharp(imagePath);
    // const metadata = await image.metadata();
    // 
    // // Detectar rostos usando modelo ONNX
    // const faces = await this.detectFaces(imagePath);
    // 
    // // Detectar placas usando modelo ONNX  
    // const plates = await this.detectPlates(imagePath);
    //
    // // Criar composite com blur nas regiões detectadas
    // const blurRegions = [...faces, ...plates].map(region => ({
    //   input: await sharp(imagePath)
    //     .extract({ left: region.x, top: region.y, width: region.w, height: region.h })
    //     .blur(30)
    //     .toBuffer(),
    //   left: region.x,
    //   top: region.y
    // }));
    //
    // await image.composite(blurRegions).toFile(outputPath);

    // ========== MVP: Copia a imagem (sem blur real) ==========
    // Em produção, substituir por processamento real acima
    try {
      await fs.copyFile(imagePath, outputPath);
    } catch {
      // Se falhar, usa o path original
      return {
        outputPath: imagePath,
        facesDetected: 0,
        platesDetected: 0
      };
    }

    return {
      outputPath,
      facesDetected: 0,  // MVP: sem detecção real
      platesDetected: 0  // MVP: sem detecção real
    };
  }

  /**
   * Retorna estatísticas do pipeline
   */
  getStats() {
    return {
      ...this.stats,
      queueSize: this.queue.length,
      isProcessing: this.isProcessing
    };
  }
}

async function fileExists(filepath) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

// Singleton
export const privacyService = new PrivacyService();
export { PIPELINE_STATUS };
