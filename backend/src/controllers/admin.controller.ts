import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/user.model';

// Временный endpoint для создания админа (удалить после использования)
export const makeAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { email, secret } = req.body;

    // Простая защита
    if (secret !== 'make-me-admin-2024') {
      return res.status(403).json({ error: 'Invalid secret' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isAdmin = true;
    await user.save();

    res.json({
      message: 'User is now admin',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ error: 'Failed to make user admin' });
  }
};
