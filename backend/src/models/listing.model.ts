import mongoose, { Schema, Document, Model } from 'mongoose';
import { IListing } from '../types/index';

export interface IListingDocument extends Omit<IListing, '_id'>, Document {}

const listingSchema = new Schema<IListingDocument>(
  {
    title: {
      type: String,
      required: true,
      index: true, // Индекс для поиска по названию
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true, // Индекс для фильтрации по категориям
    },
    price: {
      type: Number,
      required: true,
      index: true, // Индекс для сортировки по цене
    },
    images: [String],
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Индекс для поиска объявлений продавца
    },
    city: {
      type: String,
      required: true,
      index: true, // Индекс для фильтрации по городу
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'archived'],
      default: 'active',
      index: true, // Индекс для фильтрации по статусу
    },
    views: {
      type: Number,
      default: 0,
    },
    savedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Составные индексы для оптимизации частых запросов
listingSchema.index({ status: 1, createdAt: -1 }); // Активные объявления, сортировка по дате
listingSchema.index({ category: 1, status: 1 }); // Фильтр по категории и статусу
listingSchema.index({ city: 1, status: 1 }); // Фильтр по городу и статусу
listingSchema.index({ sellerId: 1, status: 1 }); // Объявления продавца
listingSchema.index({ title: 'text', description: 'text' }); // Полнотекстовый поиск

export default mongoose.model<IListingDocument>('Listing', listingSchema);
