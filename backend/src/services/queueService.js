/**
 * Queue Service (Dispatcher)
 * 
 * Implementa padrão Produtor-Consumidor via Redis (BullMQ).
 * Garante escalabilidade paralela para N vias de monetização.
 * 
 * Fluxos de fila:
 * 1. Queue "privacy" - desfoca faces e placas.
 * 2. Queue "dispatch-hivemapper" - envia payload para Hivemapper.
 * 3. Queue "dispatch-mapillary" - manipula EXIF e envia para Mapillary.
 * 4. Queue "dispatch-natix" - envia dados de tráfego/anomalias via ML/Edge data.
 */

import { Queue, Worker } from 'bullmq';
import { logger } from '../utils/logger.js';
import { privacyService } from './privacyService.js';
import { hivemapperService } from './hivemapperService.js';
import { mapillaryService } from './mapillaryService.js';
import { natixService } from './natixService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    this.natixQueue = new Queue('dispatch-natix', { connection });
    
    this.setupWorkers();
  }

  /**
   * Enfilera um lote de frames capturados para processamento base.
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

      const blurredResult = await privacyService.processImage(frame.imagePath);

      await prisma.frame.update({
        where: { id: frameId },
        data: { imagePath: blurredResult.outputPath }
      });

      // Pipeline de Distribuição Multi-Stream (Totalmente assíncrono e invisível para o app)
      await this.hivemapperQueue.add('send-hm', { frameId });
      await this.mapillaryQueue.add('send-map', { frameId });
      await this.natixQueue.add('send-natix', { frameId });

    }, { connection, concurrency: 5 });

    // ----------------------------------------------------
    // WORKER 2: HIVEMAPPER (Solana/Beemaps)
    // ----------------------------------------------------
    new Worker('dispatch-hivemapper', async job => {
      const { frameId } = job.data;
      const frame = await prisma.frame.findUnique({ where: { id: frameId } });
      await hivemapperService.submitBatch([frame]);
    }, { connection, concurrency: 10 });

    // ----------------------------------------------------
    // WORKER 3: MAPILLARY (Meta)
    // ----------------------------------------------------
    new Worker('dispatch-mapillary', async job => {
      const { frameId } = job.data;
      const frame = await prisma.frame.findUnique({ where: { id: frameId } });
      if (frame) {
          await mapillaryService.injectExifData(frame.imagePath, frame);
          // O upload de fato seria em lotes formando "Sequences"
      }
    }, { connection, concurrency: 10 });

    // ----------------------------------------------------
    // WORKER 4: NATIX (Drive&Earn / Traffic Flow)
    // ----------------------------------------------------
    new Worker('dispatch-natix', async job => {
      const { frameId } = job.data;
      const frame = await prisma.frame.findUnique({ where: { id: frameId } });
      if (frame) {
          await natixService.extractAndSubmitTrafficData(frame);
      }
    }, { connection, concurrency: 10 });
  }
}

export const queueService = new QueueService();
