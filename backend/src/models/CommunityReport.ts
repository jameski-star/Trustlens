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
  screenshots: string[];
  isVerified: boolean;
  reports: number;
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
  screenshots: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  reports: { type: Number, default: 1 },
}, { timestamps: true });

communityReportSchema.index({ type: 1, status: 1 });
communityReportSchema.index({ createdAt: -1 });
communityReportSchema.index({ upvotes: -1 });

communityReportSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as Record<string, unknown>;
  if (update && typeof update.$inc === 'object' && update.$inc !== null) {
    const inc = update.$inc as Record<string, number>;
    if (inc.upvotes) {
      const doc = await this.model.findOne(this.getQuery()).select('upvotes status');
      if (doc && doc.upvotes + inc.upvotes >= 5 && doc.status !== 'scam_alert') {
        this.set('status', 'scam_alert');
      }
    }
  }
});

export const CommunityReport = mongoose.model<ICommunityReportDocument>('CommunityReport', communityReportSchema);
