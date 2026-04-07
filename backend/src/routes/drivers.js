import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/v1/drivers - Listar todos motoristas (admin)
router.get('/', authenticate, authorizeAdmin, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = status ? { status } : {};

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, phone: true, status: true,
          balanceBrl: true, totalKm: true, totalFrames: true, createdAt: true,
          _count: { select: { sessions: true } }
        }
      }),
      prisma.driver.count({ where })
    ]);

    res.json({
      success: true,
      data: drivers,
      meta: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/drivers/me - Perfil do motorista logado
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const driver = await prisma.driver.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, phone: true, status: true,
        walletAddress: true, balanceBrl: true, totalKm: true, totalFrames: true,
        createdAt: true,
        sessions: {
          orderBy: { startTime: 'desc' },
          take: 10,
          select: { id: true, startTime: true, endTime: true, totalKm: true, validFrames: true, syncStatus: true }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { id: true, type: true, amount: true, currency: true, status: true, createdAt: true }
        }
      }
    });

    if (!driver) throw new AppError('Motorista não encontrado', 404);

    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/drivers/:id/status - Aprovar/bloquear motorista (admin)
router.patch('/:id/status', authenticate, authorizeAdmin, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { status } = req.body;

    if (!['approved', 'blocked', 'pending'].includes(status)) {
      throw new AppError('Status inválido', 400);
    }

    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: { status },
      select: { id: true, name: true, email: true, status: true }
    });

    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/drivers/:id - Detalhes do motorista (admin)
router.get('/:id', authenticate, authorizeAdmin, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const driver = await prisma.driver.findUnique({
      where: { id: req.params.id },
      include: {
        sessions: { orderBy: { startTime: 'desc' }, take: 30 },
        transactions: { orderBy: { createdAt: 'desc' }, take: 50 }
      }
    });

    if (!driver) throw new AppError('Motorista não encontrado', 404);

    const { passwordHash, ...driverData } = driver;
    res.json({ success: true, data: driverData });
  } catch (error) {
    next(error);
  }
});

export default router;
