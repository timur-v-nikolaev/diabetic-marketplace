export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  phone: string;
  city: string;
  rating: number;
  reviewsCount: number;
  isSeller: boolean;
}

export interface Listing {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  sellerId: User;
  city: string;
  status: 'active' | 'sold' | 'archived';
  views: number;
  savedBy: string[];
  rating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  listingId: string;
  senderId: string;
  receiverId: string;
  text: string;
  read: boolean;
  createdAt: string;
}
