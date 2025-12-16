import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from '../types/index';

export interface ICategoryDocument extends Omit<ICategory, '_id'>, Document {}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    icon: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICategoryDocument>('Category', categorySchema);
