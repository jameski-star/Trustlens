import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityReportDocument extends Document {
  target: string;
  type: 'url' | 'email' | 'phone' | 'whatsapp' | 'crypto' | 'investment';
  description: string;
  status: 'published' | 'pending' | 'rejected';
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const communityReportSchema = new Schema<ICommunityReportDocument>({
  target: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: ['url', 'email', 'phone', 'whatsapp', 'crypto', 'investment'],
    required: true,
  },
  description: { type: String, required: true, maxlength: 5000 },
  status: {
    type: String,
    enum: ['published', 'pending', 'rejected'],
    default: 'pending',
  },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
}, { timestamps: true });

communityReportSchema.index({ type: 1, status: 1 });
communityReportSchema.index({ createdAt: -1 });

export const CommunityReport = mongoose.model<ICommunityReportDocument>('CommunityReport', communityReportSchema);
