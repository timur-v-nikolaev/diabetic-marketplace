import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import User from '../models/user.model';

/**
 * Middleware для проверки прав администратора
 * Требует предварительной аутентификации через authMiddleware
 */
export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id).select('isAdmin');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * Middleware для проверки что пользователь является владельцем ресурса
 * или админом
 */
export const ownerOrAdminMiddleware = (ownerIdField: string = 'sellerId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findById(req.user.id).select('isAdmin');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Админы имеют доступ ко всему
      if (user.isAdmin) {
        return next();
      }

      // Проверяем владельца в теле запроса или будет проверяться в контроллере
      // Этот middleware устанавливает флаг для дальнейшей проверки
      (req as any).isAdmin = false;
      (req as any).currentUserId = req.user.id;

      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};
