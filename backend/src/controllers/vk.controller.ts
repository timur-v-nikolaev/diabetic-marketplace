import { Response } from 'express';
import crypto from 'crypto';
import User from '../models/user.model';
import { AuthRequest, generateToken } from '../middleware/auth';

interface VKUserData {
  vk_user_id: number;
  vk_app_id: number;
  vk_is_app_user: number;
  vk_are_notifications_enabled: number;
  vk_language: string;
  vk_ref: string;
  vk_access_token_settings: string;
  vk_group_id?: number;
  vk_viewer_group_role?: string;
  vk_platform: string;
  vk_is_favorite: number;
  vk_ts: number;
  sign: string;
  // Дополнительные данные пользователя
  first_name?: string;
  last_name?: string;
  photo_200?: string;
}

/**
 * Валидация launch params от VK Mini Apps
 * @see https://dev.vk.com/mini-apps/development/launch-params-sign
 */
function validateVKLaunchParams(launchParams: string, secretKey: string): VKUserData | null {
  try {
    const urlParams = new URLSearchParams(launchParams);
    const sign = urlParams.get('sign');
    
    if (!sign) {
      console.error('Sign not found in VK launch params');
      return null;
    }

    // Собираем параметры, которые начинаются с vk_
    const vkParams: [string, string][] = [];
    urlParams.forEach((value, key) => {
      if (key.startsWith('vk_')) {
        vkParams.push([key, value]);
      }
    });

    // Сортируем параметры
    vkParams.sort((a, b) => a[0].localeCompare(b[0]));

    // Создаем строку для подписи
    const paramsString = vkParams.map(([key, value]) => `${key}=${value}`).join('&');

    // Вычисляем подпись
    const calculatedSign = crypto
      .createHmac('sha256', secretKey)
      .update(paramsString)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Сравниваем подписи
    if (calculatedSign !== sign) {
      console.error('VK sign mismatch');
      return null;
    }

    // Проверяем время (не старше 1 часа)
    const vkTs = parseInt(urlParams.get('vk_ts') || '0', 10);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (currentTime - vkTs > 3600) {
      console.error('VK launch params expired');
      return null;
    }

    // Возвращаем данные пользователя
    return {
      vk_user_id: parseInt(urlParams.get('vk_user_id') || '0', 10),
      vk_app_id: parseInt(urlParams.get('vk_app_id') || '0', 10),
      vk_is_app_user: parseInt(urlParams.get('vk_is_app_user') || '0', 10),
      vk_are_notifications_enabled: parseInt(urlParams.get('vk_are_notifications_enabled') || '0', 10),
      vk_language: urlParams.get('vk_language') || 'ru',
      vk_ref: urlParams.get('vk_ref') || '',
      vk_access_token_settings: urlParams.get('vk_access_token_settings') || '',
      vk_platform: urlParams.get('vk_platform') || '',
      vk_is_favorite: parseInt(urlParams.get('vk_is_favorite') || '0', 10),
      vk_ts: vkTs,
      sign: sign,
    };
  } catch (error) {
    console.error('Error validating VK launch params:', error);
    return null;
  }
}

/**
 * Авторизация через VK Mini App
 */
export const vkAuth = async (req: AuthRequest, res: Response) => {
  try {
    const { launchParams, userData } = req.body;

    if (!launchParams) {
      return res.status(400).json({ error: 'launchParams is required' });
    }

    const vkSecretKey = process.env.VK_APP_SECRET;
    
    if (!vkSecretKey) {
      console.error('VK_APP_SECRET not configured');
      return res.status(500).json({ error: 'VK auth not configured' });
    }

    // Валидируем launch params
    const vkData = validateVKLaunchParams(launchParams, vkSecretKey);

    if (!vkData) {
      return res.status(401).json({ error: 'Invalid VK data' });
    }

    // Ищем или создаём пользователя
    let user = await User.findOne({ vkId: vkData.vk_user_id });

    if (!user) {
      // Создаём нового пользователя
      const fullName = userData?.first_name && userData?.last_name 
        ? `${userData.first_name} ${userData.last_name}`
        : `VK User ${vkData.vk_user_id}`;

      user = new User({
        vkId: vkData.vk_user_id,
        name: fullName,
        avatar: userData?.photo_200 || null,
        // Для VK пользователей email не обязателен
        email: `vk_${vkData.vk_user_id}@vk.local`,
        // Генерируем случайный пароль (не будет использоваться)
        password: crypto.randomBytes(32).toString('hex'),
        phone: '', // Будет заполнен позже
        city: userData?.city?.title || '', // Если есть данные о городе
        // Согласия
        consents: {
          personalData: { agreed: true, date: new Date() },
          privacyPolicy: { agreed: true, date: new Date() },
        },
      });

      await user.save();
    } else {
      // Обновляем данные пользователя
      if (userData?.first_name && userData?.last_name) {
        user.name = `${userData.first_name} ${userData.last_name}`;
      }
      
      if (userData?.photo_200 && !user.avatar) {
        user.avatar = userData.photo_200;
      }

      await user.save();
    }

    const token = generateToken(user._id.toString(), user.email);

    res.json({
      message: 'VK auth successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        vkId: user.vkId,
        avatar: user.avatar,
        city: user.city,
        phone: user.phone,
        needsProfileCompletion: !user.phone || !user.city,
      },
    });
  } catch (error) {
    console.error('VK auth error:', error);
    res.status(500).json({ error: 'VK authentication failed' });
  }
};

/**
 * Получение VK профиля текущего пользователя
 */
export const getVKProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.vkId) {
      return res.status(400).json({ error: 'User is not linked to VK' });
    }

    res.json({
      id: user._id,
      name: user.name,
      vkId: user.vkId,
      avatar: user.avatar,
      city: user.city,
      phone: user.phone,
    });
  } catch (error) {
    console.error('Get VK profile error:', error);
    res.status(500).json({ error: 'Failed to get VK profile' });
  }
};

/**
 * Дополнение профиля VK пользователя
 */
export const completeVKProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { phone, city } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (phone) user.phone = phone;
    if (city) user.city = city;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        vkId: user.vkId,
        avatar: user.avatar,
        city: user.city,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Complete VK profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
