/**
 * Простой logger utility для замены console.log
 * В будущем можно заменить на winston или pino
 */

type LogLevel = 'info' | 'error' | 'warn' | 'debug';

class Logger {
  private env: string;

  constructor() {
    this.env = process.env.NODE_ENV || 'development';
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  info(message: string, meta?: any) {
    console.log(this.formatMessage('info', message, meta));
  }

  error(message: string, error?: any) {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(this.formatMessage('error', message, errorDetails));
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatMessage('warn', message, meta));
  }

  debug(message: string, meta?: any) {
    if (this.env === 'development') {
      console.log(this.formatMessage('debug', message, meta));
    }
  }
}

export const logger = new Logger();
