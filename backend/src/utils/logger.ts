/**
 * Structured Logger - Production-ready logging utility
 * Поддерживает structured logging для интеграции с ELK, Datadog и т.д.
 */

type LogLevel = 'info' | 'error' | 'warn' | 'debug' | 'http';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  environment: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  statusCode?: number;
  method?: string;
  path?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  meta?: Record<string, any>;
}

interface RequestContext {
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
}

class Logger {
  private env: string;
  private service: string;
  private context: RequestContext = {};

  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.service = 'diabetic-marketplace-backend';
  }

  /**
   * Установка контекста запроса (для трейсинга)
   */
  setContext(ctx: RequestContext) {
    this.context = { ...ctx };
  }

  clearContext() {
    this.context = {};
  }

  private createEntry(level: LogLevel, message: string, meta?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      environment: this.env,
      ...this.context,
      ...(meta && { meta }),
    };
  }

  private formatForConsole(entry: LogEntry): string {
    // В development - читаемый формат
    if (this.env === 'development') {
      const color = {
        info: '\x1b[36m',    // cyan
        error: '\x1b[31m',   // red
        warn: '\x1b[33m',    // yellow
        debug: '\x1b[35m',   // magenta
        http: '\x1b[32m',    // green
      }[entry.level];
      const reset = '\x1b[0m';
      
      let log = `${color}[${entry.timestamp}] [${entry.level.toUpperCase()}]${reset} ${entry.message}`;
      
      if (entry.requestId) log += ` (req: ${entry.requestId})`;
      if (entry.duration) log += ` (${entry.duration}ms)`;
      if (entry.meta) log += ` ${JSON.stringify(entry.meta)}`;
      if (entry.error) log += `\n  Error: ${entry.error.message}`;
      
      return log;
    }
    
    // В production - JSON для машинной обработки
    return JSON.stringify(entry);
  }

  private log(level: LogLevel, message: string, meta?: Record<string, any>) {
    const entry = this.createEntry(level, message, meta);
    const formatted = this.formatForConsole(entry);

    switch (level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'debug':
        if (this.env === 'development') {
          console.log(formatted);
        }
        break;
      default:
        console.log(formatted);
    }

    return entry;
  }

  info(message: string, meta?: Record<string, any>) {
    return this.log('info', message, meta);
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, any>) {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: this.env === 'development' ? error.stack : undefined,
    } : undefined;

    const entry = this.createEntry('error', message, meta);
    if (errorDetails) {
      entry.error = errorDetails;
    }

    const formatted = this.formatForConsole(entry);
    console.error(formatted);
    
    return entry;
  }

  warn(message: string, meta?: Record<string, any>) {
    return this.log('warn', message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    return this.log('debug', message, meta);
  }

  /**
   * HTTP request logging
   */
  http(method: string, path: string, statusCode: number, duration: number, meta?: Record<string, any>) {
    const entry = this.createEntry('http', `${method} ${path}`, {
      ...meta,
      statusCode,
      duration,
    });
    entry.method = method;
    entry.path = path;
    entry.statusCode = statusCode;
    entry.duration = duration;

    const formatted = this.formatForConsole(entry);
    console.log(formatted);
    
    return entry;
  }

  /**
   * Создание child logger с предустановленным контекстом
   */
  child(context: RequestContext): Logger {
    const childLogger = new Logger();
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }
}

export const logger = new Logger();

// Express middleware для логирования HTTP запросов
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Добавляем requestId в заголовки ответа
  res.setHeader('X-Request-ID', requestId);
  
  // Сохраняем context для этого запроса
  req.logger = logger.child({ 
    requestId,
    userId: req.user?.id,
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req.method, req.path, res.statusCode, duration, {
      requestId,
      userId: req.user?.id,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection?.remoteAddress,
    });
  });

  next();
};
