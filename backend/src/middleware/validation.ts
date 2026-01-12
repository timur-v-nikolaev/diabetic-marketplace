import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';

/**
 * Middleware для валидации ObjectId в параметрах
 * Защита от NoSQL injection через невалидные ID
 */
export const validateObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: `Invalid ${paramName}`,
        details: 'Parameter must be a valid ObjectId'
      });
    }
    
    next();
  };
};

/**
 * Проверка на валидный ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id) && 
         new mongoose.Types.ObjectId(id).toString() === id;
};

/**
 * Настройки для санитизации HTML
 * Удаляет все опасные теги и атрибуты
 */
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [], // Никаких HTML тегов
  allowedAttributes: {},
  disallowedTagsMode: 'recursiveEscape',
};

/**
 * Санитизация текста - удаляет все HTML теги
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  return sanitizeHtml(text.trim(), sanitizeOptions);
};

/**
 * Middleware для обработки результатов валидации
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Выполняем все валидации параллельно
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: 'path' in err ? err.path : 'unknown',
        message: err.msg
      }))
    });
  };
};

/**
 * Валидаторы для создания объявления
 */
export const validateCreateListing = [
  body('title')
    .trim()
    .notEmpty().withMessage('Название обязательно')
    .isLength({ min: 3, max: 100 }).withMessage('Название: 3-100 символов')
    .customSanitizer(sanitizeText),
  body('description')
    .trim()
    .notEmpty().withMessage('Описание обязательно')
    .isLength({ min: 10, max: 2000 }).withMessage('Описание: 10-2000 символов')
    .customSanitizer(sanitizeText),
  body('price')
    .isNumeric().withMessage('Цена должна быть числом')
    .custom(value => value >= 0 && value <= 10000000).withMessage('Цена: 0-10000000'),
  body('category')
    .trim()
    .notEmpty().withMessage('Категория обязательна')
    .customSanitizer(sanitizeText),
  body('city')
    .trim()
    .notEmpty().withMessage('Город обязателен')
    .isLength({ max: 100 }).withMessage('Город: максимум 100 символов')
    .customSanitizer(sanitizeText),
  body('images')
    .optional()
    .isArray({ max: 10 }).withMessage('Максимум 10 изображений'),
];

/**
 * Валидаторы для обновления профиля
 */
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Имя: 2-50 символов')
    .customSanitizer(sanitizeText),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\+\-\(\)]+$/).withMessage('Неверный формат телефона')
    .isLength({ max: 20 }).withMessage('Телефон: максимум 20 символов'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Город: максимум 100 символов')
    .customSanitizer(sanitizeText),
];

/**
 * Валидаторы для сообщений
 */
export const validateMessage = [
  body('content')
    .trim()
    .notEmpty().withMessage('Сообщение не может быть пустым')
    .isLength({ max: 5000 }).withMessage('Сообщение: максимум 5000 символов')
    .customSanitizer(sanitizeText),
  body('receiverId')
    .optional()
    .custom(isValidObjectId).withMessage('Неверный ID получателя'),
  body('listingId')
    .optional()
    .custom(isValidObjectId).withMessage('Неверный ID объявления'),
];

/**
 * Валидаторы для отзывов
 */
export const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Рейтинг: 1-5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Комментарий: максимум 1000 символов')
    .customSanitizer(sanitizeText),
];

/**
 * Валидаторы для query параметров листингов
 */
export const validateListingsQuery = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Страница: 1-1000'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Лимит: 1-100'),
  query('minPrice')
    .optional()
    .isInt({ min: 0 }).withMessage('Минимальная цена >= 0'),
  query('maxPrice')
    .optional()
    .isInt({ min: 0 }).withMessage('Максимальная цена >= 0'),
  query('category')
    .optional()
    .trim()
    .customSanitizer(sanitizeText),
  query('city')
    .optional()
    .trim()
    .customSanitizer(sanitizeText),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Поиск: максимум 100 символов')
    .customSanitizer(sanitizeText),
];

/**
 * Валидатор для параметра ID
 */
export const validateIdParam = (paramName: string = 'id') => [
  param(paramName)
    .custom(isValidObjectId).withMessage(`Неверный ${paramName}`)
];
