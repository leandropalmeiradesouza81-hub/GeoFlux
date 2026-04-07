/**
 * Queue Service (Dispatcher)
 * 
 * Implementa padrão Produtor-Consumidor via Redis (BullMQ).
 * Garante escalabilidade para 3.600+ km de dados (dezenas de milhares de frames/dia).
 * 
 * Fluxos de fila:
 * 1. Queue "privacy" - desfoca faces e placas.
 * 2. Queue "dispatch-hivemapper" - assina payload ED25519 e manda pro Hivemapper.
 * 3. Queue "dispatch-mapillary" - manipula EXIF e manda pro Mapillary Sequence.
 */

import { Queue, Worker } from 'bullmq';
import { logger } from '../utils/logger.js';
import { privacyService } from './privacyService.js';
import { hivemapperService } from './hivemapperService.js';
import { mapillaryService } from './mapillaryService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Necessário ter Redis rodando na porta padrão.
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
};

class QueueService {
  constructor() {
    this.privacyQueue = new Queue('privacy-processing', { connection });
    this.hivemapperQueue = new Queue('dispatch-hivemapper', { connection });
    this.mapillaryQueue = new Queue('dispatch-mapillary', { connection });
    
    this.setupWorkers();
  }

  /**
   * Enfilera um lote de frames que veio do App após validação de GPS
   */
  async enqueueInitialFrames(framesIds) {
    for (const id of framesIds) {
      await this.privacyQueue.add('blur-frame', { frameId: id });
    }
    logger.info(`📥 [Fila] ${framesIds.length} frames colocados na Privacy Queue.`);
  }

  /**
   * Inicia processos assíncronos
   */
  setupWorkers() {
    // ----------------------------------------------------
    // WORKER 1: PRIVACY
    // ----------------------------------------------------
    new Worker('privacy-processing', async job => {
      const { frameId } = job.data;
      
      const frame = await prisma.frame.findUnique({ where: { id: frameId } });
      if (!frame || !frame.imagePath) return;

      // Blur Faces and Plates (IA ONNX)
      const blurredResult = await privacyService.processImage(frame.imagePath);

      // Marca o banco de dados
      await prisma.frame.update({
        where: { id: frameId },
        data: { imagePath: blurredResult.outputPath }
      });

      // Dispatch "Multi-marketplace" (Envia para os outros dois de forma paralela)
      await this.hivemapperQueue.add('send-hm', { frameId });
      await this.mapillaryQueue.add('send-map', { frameId });

    }, { connection, concurrency: 5 }); // Permite processar até 5 por vez por core!

    // ----------------------------------------------------
    // WORKER 2: HIVEMAPPER (Solana/Beemaps)
    // ----------------------------------------------------
    new Worker('dispatch-hivemapper', async job => {
      const { frameId } = job.data;
      const frame = await prisma.frame.findUnique({ where: { id: frameId } });

      // O hivemapperService precisa receber em array para submissão
      await hivemapperService.submitBatch([frame]);

    }, { connection, concurrency: 10 }); // API upload pode ter concorrência maior

    // ----------------------------------------------------
    // WORKER 3: MAPILLARY (Meta)
    // ----------------------------------------------------
    new Worker('dispatch-mapillary', async job => {
      const { frameId } = job.data;
      const frame = await prisma.frame.findUnique({ where: { id: frameId } });

      // Muta as meta-tags do EXIF para o padão aberto
      const exifPath = await mapillaryService.injectExifData(frame.imagePath, frame);
      
      // WIP: Aqui enviaríamos para um bucket Mapillary.
      // E agruparíamos as imagens para criar um "Sequence" por sessionId em vez de por frame.
      
    }, { connection, concurrency: 10 });
  }
}

export const queueService = new QueueService();
