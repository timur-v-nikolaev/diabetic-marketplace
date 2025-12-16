import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import Listing from '../models/listing.model';

// Получить или создать чат
export const getOrCreateConversation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { listingId, sellerId } = req.body;

    if (!listingId || !sellerId) {
      return res.status(400).json({ error: 'Missing listingId or sellerId' });
    }

    // Проверяем, что пользователь не пытается создать чат с самим собой
    if (req.user.id === sellerId) {
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Проверяем существование листинга
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Ищем существующий чат между этими участниками для этого объявления
    let conversation = await Conversation.findOne({
      listingId,
      participants: { $all: [req.user.id, sellerId] },
    })
      .populate('participants', 'name avatar')
      .populate('listingId', 'title price images');

    // Если чата нет - создаем новый
    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user.id, sellerId],
        listingId,
      });
      await conversation.save();
      
      // Populate после сохранения
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar')
        .populate('listingId', 'title price images');
    }

    res.json(conversation);
  } catch (error) {
    console.error('Get or create conversation error:', error);
    res.status(500).json({ error: 'Failed to get or create conversation' });
  }
};

// Получить все чаты пользователя
export const getUserConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate('participants', 'name avatar')
      .populate('listingId', 'title price images')
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

// Отправить сообщение
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({ error: 'Missing conversationId or text' });
    }

    // Проверяем, что пользователь является участником чата
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === req.user!.id
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Not a participant of this conversation' });
    }

    // Создаем сообщение
    const message = new Message({
      conversationId,
      senderId: req.user.id,
      text,
    });

    await message.save();

    // Обновляем последнее сообщение в чате
    conversation.lastMessage = text;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate sender info
    const populatedMessage = await Message.findById(message._id).populate(
      'senderId',
      'name avatar'
    );

    res.json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Получить сообщения чата
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { conversationId } = req.params;

    // Проверяем, что пользователь является участником чата
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === req.user!.id
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Not a participant of this conversation' });
    }

    // Получаем сообщения
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: 1 });

    // Помечаем непрочитанные сообщения как прочитанные
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: req.user.id },
        read: false,
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

// Удалить чат
export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === req.user!.id
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Not a participant of this conversation' });
    }

    // Удаляем все сообщения
    await Message.deleteMany({ conversationId });

    // Удаляем чат
    await Conversation.findByIdAndDelete(conversationId);

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};
