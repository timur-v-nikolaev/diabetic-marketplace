import mongoose, { Schema, Document } from 'mongoose';
import { IReview } from '../types/index';

export interface IReviewDocument extends Omit<IReview, '_id'>, Document {}

const reviewSchema = new Schema<IReviewDocument>(
  {
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IReviewDocument>('Review', reviewSchema);
