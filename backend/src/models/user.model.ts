import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from '../types/index';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(password: string): Promise<boolean>;
}

interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isSeller: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['none', 'pending', 'verified', 'rejected'],
      default: 'none',
    },
    verificationDocuments: {
      type: [String],
      default: [],
    },
    verificationDate: {
      type: Date,
      default: null,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    favoriteSellers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Telegram Mini App поля
    telegramId: {
      type: Number,
      unique: true,
      sparse: true, // Позволяет null значения для уникального индекса
    },
    telegramUsername: {
      type: String,
      default: null,
    },
    // VK Mini App поля
    vkId: {
      type: Number,
      unique: true,
      sparse: true,
    },
    vkUsername: {
      type: String,
      default: null,
    },
    // Согласия пользователя (для ФЗ-152)
    consents: {
      personalData: {
        agreed: { type: Boolean, default: false },
        date: { type: Date, default: null },
      },
      privacyPolicy: {
        agreed: { type: Boolean, default: false },
        date: { type: Date, default: null },
      },
      marketing: {
        agreed: { type: Boolean, default: false },
        date: { type: Date, default: null },
      },
    },
    // Запрос на удаление данных
    deletionRequested: {
      type: Boolean,
      default: false,
    },
    deletionRequestedAt: {
      type: Date,
      default: null,
    },
    favoriteListings: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
      },
    ],
  },
  { timestamps: true }
);

// Хешируем пароль перед сохранением
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as any);
  }
});

// Метод для проверки пароля
userSchema.methods.comparePassword = async function (
  this: IUserDocument,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Статический метод для поиска по email
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

export default mongoose.model<IUserDocument, IUserModel>('User', userSchema);
