import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorizeDriver } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Multer config para receber imagens temporariamente
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/temp'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

// POST /api/v1/uploads/session/start - Iniciar sessão de captura
router.post('/session/start', authenticate, authorizeDriver, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    const driver = await prisma.driver.findUnique({ where: { id: req.user.id } });
    if (driver.status !== 'approved') {
      throw new AppError('Conta não aprovada para captura', 403);
    }

    const session = await prisma.captureSession.create({
      data: {
        driverId: req.user.id,
        startTime: new Date()
      }
    });

    logger.info(`📸 Sessão de captura iniciada: ${session.id} (driver: ${req.user.id})`);

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/uploads/session/:sessionId/end - Finalizar sessão
router.post('/session/:sessionId/end', authenticate, authorizeDriver, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    const session = await prisma.captureSession.update({
      where: { id: req.params.sessionId },
      data: {
        endTime: new Date(),
        status: 'pending_upload'
      }
    });

    logger.info(`🛑 Sessão encerrada: ${session.id} | ${session.totalKm}km | ${session.totalFrames} frames`);

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/uploads/frames - Upload de batch de frames (sync Wi-Fi)
router.post('/frames', authenticate, authorizeDriver, upload.array('images', 50), async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { sessionId, frames } = req.body;

    if (!sessionId || !frames) {
      throw new AppError('sessionId e frames são obrigatórios', 400);
    }

    const parsedFrames = typeof frames === 'string' ? JSON.parse(frames) : frames;
    const files = req.files || [];

    // Validar que a sessão pertence ao motorista
    const session = await prisma.captureSession.findFirst({
      where: { id: sessionId, driverId: req.user.id }
    });

    if (!session) {
      throw new AppError('Sessão não encontrada', 404);
    }

    // Inserir frames no banco
    const createdFrames = [];
    for (const frame of parsedFrames) {
      // Filtro de precisão: descartar se accuracy > 15m
      if (frame.accuracy > 15) {
        logger.debug(`⚠️ Frame descartado (accuracy: ${frame.accuracy}m > 15m)`);
        continue;
      }

      const matchingFile = files.find(f => f.originalname === frame.imageFilename);

      const created = await prisma.frame.create({
        data: {
          sessionId,
          latitude: frame.latitude,
          longitude: frame.longitude,
          altitude: frame.altitude || null,
          speed: frame.speed || null,
          bearing: frame.bearing || null,
          accuracy: frame.accuracy,
          capturedAt: new Date(frame.timestamp),
          imagePath: matchingFile ? matchingFile.path : null,
          metadataJson: {
            lat: frame.latitude,
            lon: frame.longitude,
            altitude: frame.altitude,
            speed: frame.speed,
            bearing: frame.bearing,
            accuracy: frame.accuracy,
            timestamp: frame.timestamp
          },
          isValid: true
        }
      });

      createdFrames.push(created);
    }

    // Atualizar contadores da sessão
    await prisma.captureSession.update({
      where: { id: sessionId },
      data: {
        totalFrames: { increment: createdFrames.length },
        validFrames: { increment: createdFrames.length },
        status: 'uploading',
        syncStatus: 'syncing'
      }
    });

    // Atualizar contadores do motorista
    await prisma.driver.update({
      where: { id: req.user.id },
      data: { totalFrames: { increment: createdFrames.length } }
    });

    logger.info(`📤 Upload: ${createdFrames.length}/${parsedFrames.length} frames aceitos (session: ${sessionId})`);

    // TODO: Enfileirar processamento de privacidade (blur faces/plates) + upload para Hivemapper

    res.json({
      success: true,
      data: {
        accepted: createdFrames.length,
        rejected: parsedFrames.length - createdFrames.length,
        sessionId,
        message: 'Frames recebidos. Processamento de privacidade será iniciado.'
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/uploads/sessions - Listar sessões do motorista
router.get('/sessions', authenticate, authorizeDriver, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    const sessions = await prisma.captureSession.findMany({
      where: { driverId: req.user.id },
      orderBy: { startTime: 'desc' },
      take: 30,
      include: { _count: { select: { frames: true } } }
    });

    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
});

export default router;
