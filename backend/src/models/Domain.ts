import mongoose, { Document, Schema } from 'mongoose';

export interface IDomainDocument extends Document {
  domain: string;
  riskScore: number;
  riskLevel: string;
  checks: number;
  lastChecked: Date;
  createdAt: Date;
  updatedAt: Date;
}

const domainSchema = new Schema<IDomainDocument>({
  domain: { type: String, required: true, unique: true, lowercase: true, index: true },
  riskScore: { type: Number, default: 50 },
  riskLevel: { type: String, default: 'medium' },
  checks: { type: Number, default: 0 },
  lastChecked: { type: Date, default: Date.now },
}, { timestamps: true });

export const Domain = mongoose.model<IDomainDocument>('Domain', domainSchema);
