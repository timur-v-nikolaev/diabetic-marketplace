import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Разрешённые MIME типы для изображений
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
] as const;

// Сигнатуры файлов (magic numbers) для валидации
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/jpg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
};

/**
 * Проверка сигнатуры файла (magic bytes)
 * Защита от подмены расширения файла
 */
const validateFileSignature = (buffer: Buffer, mimeType: string): boolean => {
  const signatures = FILE_SIGNATURES[mimeType];
  if (!signatures) return false;

  return signatures.some(signature => {
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) return false;
    }
    return true;
  });
};

/**
 * Middleware для валидации загруженного файла по сигнатуре
 */
export const validateUploadedFile = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const buffer = await fs.promises.readFile(filePath);
    
    // Проверяем magic bytes
    const isValid = validateFileSignature(buffer, req.file.mimetype);
    
    if (!isValid) {
      // Удаляем подозрительный файл
      await fs.promises.unlink(filePath);
      return res.status(400).json({ 
        error: 'Invalid file content. File signature does not match declared type.' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'File validation failed' });
  }
};

// Настройка хранилища для аватаров
const avatarStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const dir = 'uploads/avatars';
    // Создаём директорию если не существует
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Безопасное расширение из MIME type
    const ext = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
    }[file.mimetype] || '.jpg';
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

// Настройка хранилища для изображений листингов
const listingStorage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const dir = 'uploads/listings';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
    }[file.mimetype] || '.jpg';
    cb(null, `listing-${uniqueSuffix}${ext}`);
  }
});

// Фильтр для проверки типа файла (только изображения)
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый тип файла. Разрешены только изображения (JPEG, PNG, GIF, WebP)'));
  }
};

// Конфигурация multer для аватаров
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Максимум 5MB
  },
  fileFilter: imageFileFilter,
});

// Конфигурация multer для изображений листингов
export const uploadListingImages = multer({
  storage: listingStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Максимум 10MB на файл
    files: 5, // Максимум 5 файлов
  },
  fileFilter: imageFileFilter,
});
