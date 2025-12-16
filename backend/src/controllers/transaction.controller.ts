import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Transaction from '../models/transaction.model';
import Listing from '../models/listing.model';
import Conversation from '../models/conversation.model';

// Создать безопасную сделку
export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { listingId, amount } = req.body;

    if (!listingId || !amount) {
      return res.status(400).json({ error: 'Missing listingId or amount' });
    }

    // Проверяем существование объявления
    const listing = await Listing.findById(listingId).populate('sellerId');
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Проверяем, что покупатель не пытается купить у себя
    if (listing.sellerId.toString() === req.user.id) {
      return res.status(400).json({ error: 'Cannot buy your own listing' });
    }

    // Проверяем, нет ли уже активной сделки по этому объявлению
    const existingTransaction = await Transaction.findOne({
      listingId,
      buyerId: req.user.id,
      status: { $in: ['pending', 'paid', 'shipped', 'delivered'] },
    });

    if (existingTransaction) {
      return res.status(400).json({ error: 'Active transaction already exists for this listing' });
    }

    // Создаем или получаем чат для сделки
    let conversation = await Conversation.findOne({
      listingId,
      participants: { $all: [req.user.id, listing.sellerId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, listing.sellerId],
        listingId,
      });
      await conversation.save();
    }

    // Создаем сделку
    const transaction = new Transaction({
      listingId,
      buyerId: req.user.id,
      sellerId: listing.sellerId,
      conversationId: conversation._id,
      amount,
      status: 'pending',
    });

    await transaction.save();

    // Populate данные
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('listingId', 'title images')
      .populate('buyerId', 'name avatar')
      .populate('sellerId', 'name avatar')
      .populate('conversationId');

    res.status(201).json(populatedTransaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Получить все сделки пользователя (покупки и продажи)
export const getUserTransactions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { role } = req.query; // 'buyer' или 'seller'

    let query: any = {};
    if (role === 'buyer') {
      query.buyerId = req.user.id;
    } else if (role === 'seller') {
      query.sellerId = req.user.id;
    } else {
      // Если роль не указана, показываем все
      query.$or = [{ buyerId: req.user.id }, { sellerId: req.user.id }];
    }

    const transactions = await Transaction.find(query)
      .populate('listingId', 'title price images')
      .populate('buyerId', 'name avatar')
      .populate('sellerId', 'name avatar')
      .populate('conversationId')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};

// Получить детали сделки
export const getTransaction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate('listingId', 'title price images description')
      .populate('buyerId', 'name avatar phone city')
      .populate('sellerId', 'name avatar phone city')
      .populate('conversationId');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Проверяем, что пользователь является участником сделки
    const isParticipant =
      transaction.buyerId._id.toString() === req.user.id ||
      transaction.sellerId._id.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
};

// Обновить статус сделки
export const updateTransactionStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { transactionId } = req.params;
    const { status, trackingNumber, paymentMethod } = req.body;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Проверяем права на изменение статуса
    const isBuyer = transaction.buyerId.toString() === req.user.id;
    const isSeller = transaction.sellerId.toString() === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Логика изменения статусов в зависимости от роли
    if (status === 'paid' && isBuyer && transaction.status === 'pending') {
      transaction.status = 'paid';
      if (paymentMethod) transaction.paymentMethod = paymentMethod;
    } else if (status === 'shipped' && isSeller && transaction.status === 'paid') {
      transaction.status = 'shipped';
      if (trackingNumber) transaction.trackingNumber = trackingNumber;
    } else if (status === 'delivered' && isBuyer && transaction.status === 'shipped') {
      transaction.status = 'delivered';
    } else if (status === 'completed' && isBuyer && transaction.status === 'delivered') {
      transaction.status = 'completed';
      transaction.completedAt = new Date();
    } else if (status === 'cancelled') {
      // Отмена возможна только если статус pending или paid
      if (transaction.status === 'pending' || transaction.status === 'paid') {
        transaction.status = 'cancelled';
        if (req.body.cancelReason) transaction.cancelReason = req.body.cancelReason;
      } else {
        return res.status(400).json({ error: 'Cannot cancel transaction at this stage' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid status transition' });
    }

    await transaction.save();

    const updatedTransaction = await Transaction.findById(transactionId)
      .populate('listingId', 'title price images')
      .populate('buyerId', 'name avatar')
      .populate('sellerId', 'name avatar')
      .populate('conversationId');

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ error: 'Failed to update transaction status' });
  }
};

// Открыть спор
export const createDispute = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { transactionId } = req.params;
    const { reason, details } = req.body;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Проверяем, что пользователь является участником сделки
    const isParticipant =
      transaction.buyerId.toString() === req.user.id ||
      transaction.sellerId.toString() === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Спор можно открыть только для определенных статусов
    if (!['paid', 'shipped', 'delivered'].includes(transaction.status)) {
      return res.status(400).json({ error: 'Cannot create dispute for this transaction status' });
    }

    transaction.status = 'disputed';
    transaction.disputeReason = reason;
    transaction.disputeDetails = details;

    await transaction.save();

    const updatedTransaction = await Transaction.findById(transactionId)
      .populate('listingId', 'title price images')
      .populate('buyerId', 'name avatar')
      .populate('sellerId', 'name avatar')
      .populate('conversationId');

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
};
