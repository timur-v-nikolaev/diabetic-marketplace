import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  body: any;
  params: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET as string) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Опциональная аутентификация - не требует токен, но если есть - добавляет user
export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET as string) as any;
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Игнорируем ошибки валидации токена для опционального middleware
    next();
  }
};

export const generateToken = (userId: string, email: string): string => {
  const expiresIn = config.JWT_EXPIRE || '7d';
  const signOptions: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };
  
  return jwt.sign({ id: userId, email }, config.JWT_SECRET as string, signOptions);
};
