import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/user.model';

// Добавить продавца в избранное
export const addFavoriteSeller = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sellerId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Проверяем, не добавлен ли уже продавец
    if (user.favoriteSellers?.some((id: any) => id.toString() === sellerId)) {
      return res.status(400).json({ error: 'Seller already in favorites' });
    }

    user.favoriteSellers = user.favoriteSellers || [];
    user.favoriteSellers.push(sellerId as any);
    await user.save();

    res.json({ message: 'Seller added to favorites' });
  } catch (error) {
    console.error('Add favorite seller error:', error);
    res.status(500).json({ error: 'Failed to add favorite seller' });
  }
};

// Удалить продавца из избранного
export const removeFavoriteSeller = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sellerId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.favoriteSellers = user.favoriteSellers?.filter(
      (id: any) => id.toString() !== sellerId
    ) || [];
    await user.save();

    res.json({ message: 'Seller removed from favorites' });
  } catch (error) {
    console.error('Remove favorite seller error:', error);
    res.status(500).json({ error: 'Failed to remove favorite seller' });
  }
};

// Получить список избранных продавцов
export const getFavoriteSellers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id).populate(
      'favoriteSellers',
      'name rating reviewsCount city avatar verificationStatus'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.favoriteSellers || []);
  } catch (error) {
    console.error('Get favorite sellers error:', error);
    res.status(500).json({ error: 'Failed to get favorite sellers' });
  }
};
