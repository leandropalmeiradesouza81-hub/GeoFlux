import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// POST /api/v1/auth/register - Registro de motorista
router.post('/register', [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('phone').notEmpty().withMessage('Telefone é obrigatório'),
  body('cpf').isLength({ min: 11, max: 14 }).withMessage('CPF inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { name, email, phone, cpf, password } = req.body;
    const prisma = req.app.locals.prisma;

    // Check if driver already exists
    const existing = await prisma.driver.findFirst({
      where: { OR: [{ email }, { phone }, { cpf }] }
    });

    if (existing) {
      throw new AppError('Motorista já cadastrado com este email, telefone ou CPF', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const driver = await prisma.driver.create({
      data: { name, email, phone, cpf, passwordHash },
      select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true }
    });

    res.status(201).json({
      success: true,
      data: {
        driver,
        message: 'Cadastro realizado! Aguarde aprovação do administrador.'
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/login - Login motorista
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    const prisma = req.app.locals.prisma;

    const driver = await prisma.driver.findUnique({ where: { email } });

    if (!driver) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    const isValid = await bcrypt.compare(password, driver.passwordHash);
    if (!isValid) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    if (driver.status === 'blocked') {
      throw new AppError('Conta bloqueada. Entre em contato com o suporte.', 403);
    }

    const token = jwt.sign(
      { id: driver.id, email: driver.email, role: 'driver' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        driver: {
          id: driver.id,
          name: driver.name,
          email: driver.email,
          status: driver.status,
          balanceBrl: driver.balanceBrl,
          totalKm: driver.totalKm,
          totalFrames: driver.totalFrames
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/admin/login - Login admin
router.post('/admin/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const prisma = req.app.locals.prisma;

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new AppError('Credenciais inválidas', 401);

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) throw new AppError('Credenciais inválidas', 401);

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: { token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
