import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Token de autenticação não fornecido', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError('Token inválido ou expirado', 401);
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    throw new AppError('Acesso restrito a administradores', 403);
  }
  next();
};

export const authorizeDriver = (req, res, next) => {
  if (req.user.role !== 'driver') {
    throw new AppError('Acesso restrito a motoristas', 403);
  }
  next();
};
