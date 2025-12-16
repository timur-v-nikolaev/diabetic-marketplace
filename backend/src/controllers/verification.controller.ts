import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/user.model';
import Notification from '../models/notification.model';

// Запрос на верификацию продавца
export const requestVerification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { documents, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verificationStatus === 'verified') {
      return res.status(400).json({ error: 'User is already verified' });
    }

    if (user.verificationStatus === 'pending') {
      return res.status(400).json({ error: 'Verification request already pending' });
    }

    user.verificationStatus = 'pending';
    user.verificationDocuments = documents || [];
    user.verificationNotes = notes || '';
    await user.save();

    res.json({
      message: 'Verification request submitted successfully',
      verificationStatus: user.verificationStatus,
    });
  } catch (error) {
    console.error('Request verification error:', error);
    res.status(500).json({ error: 'Failed to submit verification request' });
  }
};

// Получить статус верификации
export const getVerificationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('verificationStatus verificationDate verificationNotes');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      verificationStatus: user.verificationStatus,
      verificationDate: user.verificationDate,
      verificationNotes: user.verificationNotes,
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
};

// Админ: одобрить верификацию
export const approveVerification = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { notes } = req.body;

    // Проверяем, что пользователь - админ
    const admin = await User.findById(req.user?.id);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verificationStatus !== 'pending') {
      return res.status(400).json({ error: 'No pending verification request' });
    }

    user.verificationStatus = 'verified';
    user.verificationDate = new Date();
    user.verificationNotes = notes || 'Verified successfully';
    user.isSeller = true;
    await user.save();
// Создать уведомление
    await Notification.create({
      userId: user._id,
      type: 'verification_approved',
      title: '✅ Верификация одобрена!',
      message: 'Поздравляем! Вы теперь верифицированный продавец. Покупатели увидят значок верификации на ваших объявлениях.',
    });

    
    res.json({
      message: 'Verification approved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verificationStatus: user.verificationStatus,
        verificationDate: user.verificationDate,
      },
    });
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({ error: 'Failed to approve verification' });
  }
};

// Админ: отклонить верификацию
export const rejectVerification = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Проверяем, что пользователь - админ
    const admin = await User.findById(req.user?.id);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verificationStatus !== 'pending') {
    // Создать уведомление
    await Notification.create({
      userId: user._id,
      type: 'verification_rejected',
      title: '❌ Верификация отклонена',
      message: `К сожалению, ваш запрос на верификацию был отклонен. Причина: ${reason || 'Не указана'}. Вы можете подать запрос повторно с корректными данными.`,
    });

      return res.status(400).json({ error: 'No pending verification request' });
    }

    user.verificationStatus = 'rejected';
    user.verificationNotes = reason || 'Verification rejected';
    user.verificationDocuments = [];
    await user.save();

    res.json({
      message: 'Verification rejected',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({ error: 'Failed to reject verification' });
  }
};

// Админ: получить все запросы на верификацию
export const getPendingVerifications = async (req: AuthRequest, res: Response) => {
  try {
    // Проверяем, что пользователь - админ
    const admin = await User.findById(req.user?.id);
    if (!admin || !admin.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const pendingUsers = await User.find({ verificationStatus: 'pending' })
      .select('name email phone city verificationDocuments verificationNotes createdAt')
      .sort({ createdAt: -1 });

    res.json({
      count: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({ error: 'Failed to get pending verifications' });
  }
};
