import { Response } from 'express';
import crypto from 'crypto';
import User from '../models/user.model';
import { AuthRequest, generateToken } from '../middleware/auth';

interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

// Валидация initData от Telegram
function validateTelegramData(initData: string, botToken: string): TelegramUserData | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      console.error('Hash not found in initData');
      return null;
    }

    // Удаляем hash из данных для проверки
    urlParams.delete('hash');
    
    // Сортируем параметры
    const params = Array.from(urlParams.entries());
    params.sort((a, b) => a[0].localeCompare(b[0]));
    
    // Создаем строку данных
    const dataCheckString = params.map(([key, value]) => `${key}=${value}`).join('\n');
    
    // Генерируем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Вычисляем хеш
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Сравниваем хеши
    if (calculatedHash !== hash) {
      console.error('Hash mismatch');
      return null;
    }

    // Проверяем auth_date (не старше 1 часа)
    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (currentTime - authDate > 3600) {
      console.error('Auth data expired');
      return null;
    }

    // Парсим данные пользователя
    const userDataString = urlParams.get('user');
    if (!userDataString) {
      console.error('User data not found');
      return null;
    }

    return JSON.parse(userDataString) as TelegramUserData;
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return null;
  }
}

// Авторизация через Telegram Mini App
export const telegramAuth = async (req: AuthRequest, res: Response) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'initData is required' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return res.status(500).json({ error: 'Telegram auth not configured' });
    }

    // Валидируем данные от Telegram
    const telegramUser = validateTelegramData(initData, botToken);

    if (!telegramUser) {
      return res.status(401).json({ error: 'Invalid Telegram data' });
    }

    // Ищем или создаём пользователя
    let user = await User.findOne({ telegramId: telegramUser.id });

    if (!user) {
      // Создаём нового пользователя
      const fullName = [telegramUser.first_name, telegramUser.last_name]
        .filter(Boolean)
        .join(' ');

      user = new User({
        telegramId: telegramUser.id,
        telegramUsername: telegramUser.username,
        name: fullName || `User${telegramUser.id}`,
        avatar: telegramUser.photo_url,
        // Для Telegram пользователей email не обязателен
        email: `tg_${telegramUser.id}@telegram.local`,
        // Генерируем случайный пароль (не будет использоваться)
        password: crypto.randomBytes(32).toString('hex'),
        phone: '', // Будет заполнен позже
        city: '', // Будет заполнен позже
      });

      await user.save();
    } else {
      // Обновляем данные пользователя
      const fullName = [telegramUser.first_name, telegramUser.last_name]
        .filter(Boolean)
        .join(' ');

      user.name = fullName || user.name;
      user.telegramUsername = telegramUser.username;
      
      if (telegramUser.photo_url && !user.avatar) {
        user.avatar = telegramUser.photo_url;
      }

      await user.save();
    }

    const token = generateToken(user._id.toString(), user.email);

    res.json({
      message: 'Telegram auth successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        avatar: user.avatar,
        phone: user.phone,
        city: user.city,
        isSeller: user.isSeller,
        verificationStatus: user.verificationStatus,
        needsProfileCompletion: !user.phone || !user.city,
      },
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(500).json({ error: 'Telegram auth failed' });
  }
};

// Обновить профиль пользователя (для завершения регистрации)
export const completeTelegramProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { phone, city } = req.body;

    if (!phone || !city) {
      return res.status(400).json({ error: 'Phone and city are required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.phone = phone;
    user.city = city;
    await user.save();

    res.json({
      message: 'Profile completed successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        telegramId: user.telegramId,
        telegramUsername: user.telegramUsername,
        avatar: user.avatar,
        phone: user.phone,
        city: user.city,
        isSeller: user.isSeller,
        verificationStatus: user.verificationStatus,
        needsProfileCompletion: false,
      },
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ error: 'Failed to complete profile' });
  }
};

// Получить данные текущего Telegram пользователя
export const getTelegramProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      telegramId: user.telegramId,
      telegramUsername: user.telegramUsername,
      avatar: user.avatar,
      phone: user.phone,
      city: user.city,
      isSeller: user.isSeller,
      rating: user.rating,
      reviewsCount: user.reviewsCount,
      verificationStatus: user.verificationStatus,
      needsProfileCompletion: !user.phone || !user.city,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};
