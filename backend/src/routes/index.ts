import { Router, Response } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, updateProfile, uploadAvatar as uploadAvatarController } from '../controllers/auth.controller';
import { makeAdmin } from '../controllers/admin.controller';
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
  getFavoriteSellers 
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
import { uploadAvatar } from '../middleware/upload';
import listingService from '../services/listing.service';

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

// Statistics route с кешированием
let statsCache: { data: any; timestamp: number } | null = null;
const STATS_CACHE_TTL = 30000; // 30 секунд

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const now = Date.now();
    
    // Проверяем кеш
    if (statsCache && (now - statsCache.timestamp) < STATS_CACHE_TTL) {
      return res.json(statsCache.data);
    }
    
    const Listing = require('../models/listing.model').default;
    
    // Параллельные запросы для оптимизации
    const [activeListings, sellers] = await Promise.all([
      Listing.countDocuments({ status: 'active' }),
      Listing.distinct('sellerId', { status: 'active' })
    ]);
    
    const data = {
      activeListings,
      sellers: sellers.length
    };
    
    // Сохраняем в кеш
    statsCache = { data, timestamp: now };
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Listings routes
router.get('/listings', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
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
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

router.get('/listings/:id', optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
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

router.post('/listings', authMiddleware, async (req: AuthRequest, res: Response) => {
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

router.put('/listings/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
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

router.delete('/listings/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await listingService.deleteListing(req.params.id, req.user?.id as string);
    res.json({ message: 'Listing deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Save/unsave listings
router.post('/listings/:id/save', authMiddleware, async (req: AuthRequest, res: Response) => {
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

router.post('/listings/:id/unsave', authMiddleware, async (req: AuthRequest, res: Response) => {
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

// User listings
router.get('/users/:userId/listings', async (req: AuthRequest, res: Response) => {
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
router.get('/verification/pending', authMiddleware, getPendingVerifications);
router.post('/verification/approve/:userId', authMiddleware, approveVerification);
router.post('/verification/reject/:userId', authMiddleware, rejectVerification);

// Notification routes
router.get('/notifications', authMiddleware, getNotifications);
router.put('/notifications/:notificationId/read', authMiddleware, markAsRead);
router.put('/notifications/read-all', authMiddleware, markAllAsRead);
router.delete('/notifications/:notificationId', authMiddleware, deleteNotification);

// Временный endpoint для создания админа (удалить после использования!)
router.post('/admin/make-admin', makeAdmin);

export default router;
