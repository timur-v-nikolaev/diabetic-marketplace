import express from 'express';
import cors from 'cors';
import compression from 'compression';
import bodyParser from 'body-parser';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { config, connectDB } from './config';
import routes from './routes';
import { logger } from './utils/logger';

const app = express();

// Security & Performance Middleware
app.disable('x-powered-by'); // Скрываем информацию о Express

// Helmet с настройками CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Для inline стилей
      imgSrc: ["'self'", "data:", "blob:", "https:"], // Разрешаем внешние изображения
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Для работы с внешними изображениями
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Для доступа к uploads
}));

app.use(compression()); // Сжатие ответов для уменьшения размера данных

// Rate limiting - защита от brute-force атак
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Лимит 100 запросов с одного IP
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/api/health',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // Лимит 5 попыток логина/регистрации
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// CORS с whitelist
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://diabet.market',
  'https://www.diabet.market',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем запросы без origin (например, от мобильных приложений или curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || 
        origin.endsWith('.trycloudflare.com') ||
        origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 часа кеширования preflight
}));
app.use(bodyParser.json({ limit: '10mb' })); // Уменьшен лимит для безопасности
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(mongoSanitize()); // Защита от NoSQL injection

// Export authLimiter для использования в routes
(app as any).authLimiter = authLimiter;

// Статическая раздача файлов для загруженных изображений
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error', err);
  
  // Не раскрываем детали ошибок в продакшене
  const isDev = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({ 
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack })
  });
});

// Обработка необработанных промисов
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(config.PORT, () => {
      logger.info(`Server running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
