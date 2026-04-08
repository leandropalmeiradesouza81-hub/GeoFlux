import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import driverRoutes from './routes/drivers.js';
import uploadRoutes from './routes/uploads.js';
import tileRoutes from './routes/tiles.js';
import financeRoutes from './routes/finance.js';
import frameRoutes from './routes/frames.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ============ Middleware ============
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Muitas requisições. Tente novamente em 15 minutos.' }
});
app.use('/api/', limiter);

// Make prisma available in routes
app.locals.prisma = prisma;

// ============ Routes ============
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'online',
      version: '0.1.0',
      timestamp: new Date().toISOString()
    }
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/tiles', tileRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/frames', frameRoutes);

// Error handler
app.use(errorHandler);

// ============ Start ============
async function start() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected');
  } catch (error) {
    logger.warn('⚠️ Database connection failed. Running in MOCK/LIMITED mode.');
    logger.debug(error.message);
  }

  app.listen(PORT, () => {
    logger.info(`🚀 GeoFlux Backend running on port ${PORT}`);
    logger.info(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
