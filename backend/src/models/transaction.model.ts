import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  listingId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'disputed' | 'cancelled';
  paymentMethod?: string;
  trackingNumber?: string;
  disputeReason?: string;
  disputeDetails?: string;
  cancelReason?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
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
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'completed', 'disputed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
    },
    trackingNumber: {
      type: String,
    },
    disputeReason: {
      type: String,
    },
    disputeDetails: {
      type: String,
    },
    cancelReason: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Indexes для быстрого поиска
TransactionSchema.index({ buyerId: 1, createdAt: -1 });
TransactionSchema.index({ sellerId: 1, createdAt: -1 });
TransactionSchema.index({ listingId: 1 });
TransactionSchema.index({ status: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
