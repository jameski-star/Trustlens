import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityReportDocument extends Document {
  target: string;
  type: 'url' | 'email' | 'phone' | 'whatsapp' | 'crypto' | 'investment';
  title: string;
  category: string;
  description: string;
  status: 'published' | 'pending' | 'rejected' | 'scam_alert';
  upvotes: number;
  downvotes: number;
  voters: Map<string, 'up' | 'down'>;
  screenshots: string[];
  isVerified: boolean;
  reports: number;
  scanStatus: 'pending' | 'scanning' | 'completed' | 'failed';
  scanResult?: {
    riskScore: number;
    riskLevel: string;
    summary: string;
  };
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
  title: { type: String, default: '' },
  category: { type: String, default: 'Other' },
  description: { type: String, required: true, maxlength: 5000 },
  status: {
    type: String,
    enum: ['published', 'pending', 'rejected', 'scam_alert'],
    default: 'pending',
  },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  voters: { type: Map, of: String, default: {} },
  screenshots: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  reports: { type: Number, default: 1 },
  scanStatus: { type: String, enum: ['pending', 'scanning', 'completed', 'failed'], default: 'pending' },
  scanResult: {
    riskScore: { type: Number },
    riskLevel: { type: String },
    summary: { type: String },
  },
}, {
  timestamps: true,
  toJSON: {
    transform(_doc, ret: Record<string, unknown>) {
      delete ret.voters;
      return ret;
    },
  },
});

communityReportSchema.index({ type: 1, status: 1 });
communityReportSchema.index({ createdAt: -1 });
communityReportSchema.index({ upvotes: -1 });

communityReportSchema.pre('save', function (next) {
  if (this.upvotes - this.downvotes >= 5 && this.status !== 'scam_alert') {
    this.status = 'scam_alert';
  }
  next();
});

export const CommunityReport = mongoose.model<ICommunityReportDocument>('CommunityReport', communityReportSchema);
