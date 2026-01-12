import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/user.model';
import Listing from '../models/listing.model';

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

// Добавить товар в избранное
export const addFavoriteListing = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { listingId } = req.params;

    // Проверяем что товар существует
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Проверяем, не добавлен ли уже товар
    if (user.favoriteListings?.some((id: any) => id.toString() === listingId)) {
      return res.status(400).json({ error: 'Listing already in favorites' });
    }

    user.favoriteListings = user.favoriteListings || [];
    user.favoriteListings.push(listingId as any);
    await user.save();

    res.json({ message: 'Listing added to favorites' });
  } catch (error) {
    console.error('Add favorite listing error:', error);
    res.status(500).json({ error: 'Failed to add favorite listing' });
  }
};

// Удалить товар из избранного
export const removeFavoriteListing = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { listingId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.favoriteListings = user.favoriteListings?.filter(
      (id: any) => id.toString() !== listingId
    ) || [];
    await user.save();

    res.json({ message: 'Listing removed from favorites' });
  } catch (error) {
    console.error('Remove favorite listing error:', error);
    res.status(500).json({ error: 'Failed to remove favorite listing' });
  }
};

// Получить список избранных товаров
export const getFavoriteListings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id).populate({
      path: 'favoriteListings',
      populate: {
        path: 'sellerId',
        select: 'name rating city avatar verificationStatus',
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.favoriteListings || []);
  } catch (error) {
    console.error('Get favorite listings error:', error);
    res.status(500).json({ error: 'Failed to get favorite listings' });
  }
};
