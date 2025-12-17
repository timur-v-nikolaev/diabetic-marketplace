import * as Sentry from '@sentry/node';
import { Express, Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * Sentry Error Tracking Integration
 * Автоматически отслеживает ошибки в production
 */

export const initSentry = (app: Express) => {
  const dsn = process.env.SENTRY_DSN;
  
  if (!dsn) {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('SENTRY_DSN not configured - error tracking disabled');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.0',
    
    // Включаем трейсинг для performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Фильтруем чувствительные данные
    beforeSend(event) {
      // Удаляем пароли и токены из данных
      if (event.request?.data) {
        const data = event.request.data;
        if (typeof data === 'object') {
          delete data.password;
          delete data.token;
          delete data.authorization;
        }
      }
      return event;
    },
    
    // Игнорируем некоторые ошибки
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Network Error',
      'timeout of 0ms exceeded',
    ],
  });

  logger.info('Sentry initialized', { environment: process.env.NODE_ENV });
};

/**
 * Middleware для добавления user context в Sentry
 */
export const sentryUserContext = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user) {
    Sentry.setUser({
      id: (req as any).user.id,
      email: (req as any).user.email,
    });
  }
  next();
};

/**
 * Middleware для отлова ошибок и отправки в Sentry
 */
export const sentryErrorHandler = Sentry.Handlers?.errorHandler?.() || ((err: Error, req: Request, res: Response, next: NextFunction) => {
  next(err);
});

/**
 * Middleware для трейсинга запросов
 */
export const sentryRequestHandler = Sentry.Handlers?.requestHandler?.() || ((req: Request, res: Response, next: NextFunction) => {
  next();
});

/**
 * Ручная отправка ошибки в Sentry
 */
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      Sentry.captureException(error);
    });
  }
  
  // Всегда логируем локально
  logger.error(error.message, error, context);
};

/**
 * Отправка сообщения в Sentry (для важных событий)
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) => {
  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      Sentry.captureMessage(message, level);
    });
  }
  
  // Логируем локально
  logger[level === 'warning' ? 'warn' : level](message, context);
};
