export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  phone: string;
  city: string;
  rating: number;
  reviewsCount: number;
  isSeller: boolean;
  verificationStatus: 'none' | 'pending' | 'verified' | 'rejected';
  verificationDocuments: string[];
  verificationDate?: Date | null;
  verificationNotes: string;
  isAdmin: boolean;
  favoriteSellers: any[];
  favoriteListings: any[];
  // Telegram Mini App поля
  telegramId?: number;
  telegramUsername?: string;
  // VK Mini App поля
  vkId?: number;
  vkUsername?: string;
  // Согласия пользователя (ФЗ-152)
  consents?: {
    personalData?: { agreed: boolean; date?: Date };
    privacyPolicy?: { agreed: boolean; date?: Date };
    marketing?: { agreed: boolean; date?: Date };
  };
  // Запрос на удаление данных
  deletionRequested?: boolean;
  deletionRequestedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IListing {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  sellerId: any;
  city: string;
  status: 'active' | 'sold' | 'archived';
  views: number;
  savedBy: any[];
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview {
  _id: string;
  listingId: any;
  buyerId: any;
  sellerId: any;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id: string;
  listingId: any;
  senderId: any;
  receiverId: any;
  text: string;
  read: boolean;
  createdAt: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  icon: string;
  description: string;
}
