import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

/**
 * Валидация MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Middleware для валидации ObjectId в параметрах
 */
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ 
        error: `Invalid ${paramName} format` 
      });
    }
    
    next();
  };
};

/**
 * Санитизация поисковых запросов для защиты от ReDoS
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  // Экранируем специальные символы regex
  return query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Валидация пароля - проверка сложности
 */
export const isStrongPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
};

/**
 * Middleware для валидации сложности пароля
 */
export const validatePassword = (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;
  
  const result = isStrongPassword(password);
  if (!result.valid) {
    return res.status(400).json({ error: result.message });
  }
  
  next();
};
