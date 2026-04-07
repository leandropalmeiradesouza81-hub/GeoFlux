import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/finance/summary - Resumo financeiro (admin)
router.get('/summary', authenticate, authorizeAdmin, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;

    const [
      totalDrivers,
      approvedDrivers,
      totalFrames,
      transactions
    ] = await Promise.all([
      prisma.driver.count(),
      prisma.driver.count({ where: { status: 'approved' } }),
      prisma.frame.count({ where: { isValid: true } }),
      prisma.transaction.groupBy({
        by: ['type', 'currency'],
        _sum: { amount: true },
        where: { status: 'confirmed' }
      })
    ]);

    // Calcular totais
    const totalKmResult = await prisma.driver.aggregate({ _sum: { totalKm: true } });
    const totalBalanceResult = await prisma.driver.aggregate({ _sum: { balanceBrl: true } });

    const totalKm = totalKmResult._sum.totalKm || 0;
    const totalPaidBrl = totalBalanceResult._sum.balanceBrl || 0;
    const totalKmCost = parseFloat(totalKm) * parseFloat(process.env.DRIVER_REWARD_PER_KM || 0.10);

    res.json({
      success: true,
      data: {
        fleet: { totalDrivers, approvedDrivers },
        production: { totalFrames, totalKm: parseFloat(totalKm) },
        finance: {
          totalPaidBrl: parseFloat(totalPaidBrl),
          totalKmCost,
          rewardPerKm: parseFloat(process.env.DRIVER_REWARD_PER_KM || 0.10),
          transactions
        },
        honey: {
          // TODO: Consultar saldo real via Solana RPC
          balance: 0,
          totalReceived: 0,
          totalSwapped: 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/finance/transactions - Histório de transações
router.get('/transactions', authenticate, authorizeAdmin, async (req, res, next) => {
  try {
    const prisma = req.app.locals.prisma;
    const { page = 1, limit = 50, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = type ? { type } : {};

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { driver: { select: { name: true, email: true } } }
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      success: true,
      data: transactions,
      meta: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
