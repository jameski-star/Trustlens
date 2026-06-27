import mongoose, { Document, Schema } from 'mongoose';

export interface ISearchHistoryDocument extends Document {
  query: string;
  type: string;
  resultId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const searchHistorySchema = new Schema<ISearchHistoryDocument>({
  query: { type: String, required: true, index: true },
  type: { type: String, required: true },
  resultId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

searchHistorySchema.index({ createdAt: -1 });
searchHistorySchema.index({ query: 'text' });

export const SearchHistory = mongoose.model<ISearchHistoryDocument>('SearchHistory', searchHistorySchema);
