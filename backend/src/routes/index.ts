import { Router, Response } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile, uploadAvatar as uploadAvatarController } from '../controllers/auth.controller';
import { telegramAuth, completeTelegramProfile, getTelegramProfile } from '../controllers/telegram.controller';
import { vkAuth, completeVKProfile, getVKProfile } from '../controllers/vk.controller';
import { 
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller';
import { 
  requestVerification, 
  getVerificationStatus, 
  approveVerification, 
  rejectVerification, 
  getPendingVerifications 
} from '../controllers/verification.controller';
import { 
  addFavoriteSeller, 
  removeFavoriteSeller, 
  getFavoriteSellers,
  addFavoriteListing,
  removeFavoriteListing,
  getFavoriteListings,
} from '../controllers/favorites.controller';
import {
  getOrCreateConversation,
  getUserConversations,
  sendMessage,
  getMessages,
  deleteConversation,
} from '../controllers/chat.controller';
import {
  createTransaction,
  getUserTransactions,
  getTransaction,
  updateTransactionStatus,
  createDispute,
} from '../controllers/transaction.controller';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { uploadAvatar } from '../middleware/upload';
import { 
  validateObjectId,
  validate,
  validateCreateListing,
  validateUpdateProfile,
  validateMessage,
  validateListingsQuery,
  validateIdParam,
  sanitizeText,
} from '../middleware/validation';
import listingService from '../services/listing.service';
import User from '../models/user.model';

const router = Router();

// Auth routes
router.post(
  '/auth/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty(),
    body('phone').notEmpty(),
    body('city').notEmpty(),
  ],
  register
);

router.post(
  '/auth/login',
  [body('email').isEmail(), body('password').notEmpty()],
  login
);

router.get('/auth/profile', authMiddleware, getProfile);

router.put('/auth/profile', authMiddleware, updateProfile);

router.post('/auth/avatar', authMiddleware, uploadAvatar.single('avatar'), uploadAvatarController);

// Telegram Mini App auth routes
router.post('/auth/telegram', telegramAuth);
router.post('/auth/telegram/complete-profile', authMiddleware, completeTelegramProfile);
router.get('/auth/telegram/profile', authMiddleware, getTelegramProfile);

// VK Mini App auth routes
router.post('/auth/vk', vkAuth);
router.post('/auth/vk/complete-profile', authMiddleware, completeVKProfile);
router.get('/auth/vk/profile', authMiddleware, getVKProfile);

// ФЗ-152: Право на удаление персональных данных
router.post('/auth/request-deletion', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.deletionRequested = true;
    user.deletionRequestedAt = new Date();
    await user.save();

    res.json({ 
      message: 'Запрос на удаление данных принят. Ваши данные будут удалены в течение 30 дней.',
      deletionRequestedAt: user.deletionRequestedAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process deletion request' });
  }
});

// ФЗ-152: Отмена запроса на удаление
router.post('/auth/cancel-deletion', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.deletionRequested = false;
    user.deletionRequestedAt = null;
    await user.save();

    res.json({ message: 'Запрос на удаление данных отменён' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel deletion request' });
  }
});

// ФЗ-152: Экспорт персональных данных
router.get('/auth/export-data', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Собираем все данные пользователя
    const Listing = require('../models/listing.model').default;
    const Message = require('../models/message.model').default;
    const Transaction = require('../models/transaction.model').default;

    const [listings, messages, transactions] = await Promise.all([
      Listing.find({ sellerId: user._id }),
      Message.find({ $or: [{ senderId: user._id }, { receiverId: user._id }] }),
      Transaction.find({ $or: [{ buyerId: user._id }, { sellerId: user._id }] }),
    ]);

    const exportData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        createdAt: user.createdAt,
        telegramId: user.telegramId,
        vkId: user.vkId,
      },
      listings: listings.map((l: any) => ({
        id: l._id,
        title: l.title,
        description: l.description,
        price: l.price,
        createdAt: l.createdAt,
      })),
      messagesCount: messages.length,
      transactionsCount: transactions.length,
      exportedAt: new Date().toISOString(),
    };

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Statistics route с улучшенным кешированием
import { statsCache as globalStatsCache, withCache } from '../utils/cache';

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const data = await withCache(
      globalStatsCache,
      'global-stats',
      async () => {
        const Listing = require('../models/listing.model').default;
        
        // Параллельные запросы для оптимизации
        const [activeListings, sellers] = await Promise.all([
          Listing.countDocuments({ status: 'active' }),
          Listing.distinct('sellerId', { status: 'active' })
        ]);
        
        return {
          activeListings,
          sellers: sellers.length
        };
      },
      30000 // 30 секунд TTL
    );
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Listings routes с валидацией
router.get('/listings', optionalAuthMiddleware, validate(validateListingsQuery), async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      category: req.query.category as string,
      city: req.query.city as string,
      minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : null,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : null,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };
    const result = await listingService.getListings(filters, req.user?.id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

router.get('/listings/:id', optionalAuthMiddleware, validateObjectId('id'), async (req: AuthRequest, res: Response) => {
  try {
    const listing = await listingService.getListingById(req.params.id, req.user?.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

router.post('/listings', authMiddleware, validate(validateCreateListing), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, price, city, images } = req.body;

    if (!title || !description || !category || !price || !city) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const listing = await listingService.createListing({
      title,
      description,
      category,
      price,
      city,
      images: images || [],
      sellerId: req.user?.id as string,
      status: 'active',
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

router.put('/listings/:id', authMiddleware, validateObjectId('id'), async (req: AuthRequest, res: Response) => {
  try {
    const listing = await listingService.updateListing(
      req.params.id,
      req.body,
      req.user?.id as string
    );
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

router.delete('/listings/:id', authMiddleware, validateObjectId('id'), async (req: AuthRequest, res: Response) => {
  try {
    await listingService.deleteListing(req.params.id, req.user?.id as string);
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Save/unsave listings
router.post('/listings/:id/save', authMiddleware, validateObjectId('id'), async (req: AuthRequest, res: Response) => {
  try {
    const listing = await listingService.saveListing(
      req.params.id,
      req.user?.id as string
    );
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save listing' });
  }
});

router.post('/listings/:id/unsave', authMiddleware, validateObjectId('id'), async (req: AuthRequest, res: Response) => {
  try {
    const listing = await listingService.unsaveListing(
      req.params.id,
      req.user?.id as string
    );
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsave listing' });
  }
});

// User profile by ID
router.get('/users/:userId/profile', validateObjectId('userId'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'name avatar rating reviewsCount city verificationStatus createdAt'
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// User listings
router.get('/users/:userId/listings', validateObjectId('userId'), async (req: AuthRequest, res: Response) => {
  try {
    const listings = await listingService.getSellerListings(req.params.userId);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user listings' });
  }
});

router.get('/users/saved', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const listings = await listingService.getSavedListings(req.user?.id as string);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved listings' });
  }
});

// Favorite sellers routes
router.post('/favorites/sellers/:sellerId', authMiddleware, addFavoriteSeller);
router.delete('/favorites/sellers/:sellerId', authMiddleware, removeFavoriteSeller);
router.get('/favorites/sellers', authMiddleware, getFavoriteSellers);

// Favorite listings routes
router.post('/favorites/listings/:listingId', authMiddleware, addFavoriteListing);
router.delete('/favorites/listings/:listingId', authMiddleware, removeFavoriteListing);
router.get('/favorites/listings', authMiddleware, getFavoriteListings);

// Categories routes for diabetic products
import Category from '../models/category.model';

router.get('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Chat routes
router.post('/conversations', authMiddleware, getOrCreateConversation);
router.get('/conversations', authMiddleware, getUserConversations);
router.get('/conversations/:conversationId/messages', authMiddleware, getMessages);
router.post('/conversations/messages', authMiddleware, sendMessage);
router.delete('/conversations/:conversationId', authMiddleware, deleteConversation);

// Transaction routes (безопасные сделки)
router.post('/transactions', authMiddleware, createTransaction);
router.get('/transactions', authMiddleware, getUserTransactions);
router.get('/transactions/:transactionId', authMiddleware, getTransaction);
router.put('/transactions/:transactionId/status', authMiddleware, updateTransactionStatus);
router.post('/transactions/:transactionId/dispute', authMiddleware, createDispute);

// Verification routes
router.post('/verification/request', authMiddleware, requestVerification);
router.get('/verification/status', authMiddleware, getVerificationStatus);
router.get('/verification/pending', authMiddleware, adminMiddleware, getPendingVerifications);
router.post('/verification/approve/:userId', authMiddleware, adminMiddleware, validateObjectId('userId'), approveVerification);
router.post('/verification/reject/:userId', authMiddleware, adminMiddleware, validateObjectId('userId'), rejectVerification);

// Notification routes
router.get('/notifications', authMiddleware, getNotifications);
router.put('/notifications/:notificationId/read', authMiddleware, validateObjectId('notificationId'), markAsRead);
router.put('/notifications/read-all', authMiddleware, markAllAsRead);
router.delete('/notifications/:notificationId', authMiddleware, validateObjectId('notificationId'), deleteNotification);

export default router;
