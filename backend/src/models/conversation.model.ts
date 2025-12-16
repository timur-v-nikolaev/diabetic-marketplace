import mongoose, { Schema, Document } from 'mongoose';

export interface IConversationDocument extends Document {
  participants: mongoose.Types.ObjectId[];
  listingId: mongoose.Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversationDocument>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Индекс для быстрого поиска чатов пользователя
conversationSchema.index({ participants: 1, lastMessageAt: -1 }); // Сортировка по последнему сообщению
conversationSchema.index({ listingId: 1 });
conversationSchema.index({ participants: 1, listingId: 1 }, { unique: true }); // Уникальность чата для объявления

export default mongoose.model<IConversationDocument>('Conversation', conversationSchema);
