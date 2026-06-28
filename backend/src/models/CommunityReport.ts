import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityReportDocument extends Document {
  type: 'url' | 'email' | 'phone' | 'whatsapp' | 'crypto' | 'investment';
  target: string;
  title: string;
  description: string;
  category: string;
  reports: number;
  isVerified: boolean;
  status: 'published' | 'pending' | 'rejected';
  screenshots: string[];
  createdAt: Date;
  updatedAt: Date;
}

const communityReportSchema = new Schema<ICommunityReportDocument>({
  type: {
    type: String,
    enum: ['url', 'email', 'phone', 'whatsapp', 'crypto', 'investment'],
    required: true,
  },
  target: { type: String, required: true, index: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  category: { type: String, required: true },
  reports: { type: Number, default: 1 },
  isVerified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['published', 'pending', 'rejected'],
    default: 'pending',
  },
  screenshots: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

communityReportSchema.index({ type: 1, status: 1 });
communityReportSchema.index({ createdAt: -1 });

export const CommunityReport = mongoose.model<ICommunityReportDocument>('CommunityReport', communityReportSchema);
