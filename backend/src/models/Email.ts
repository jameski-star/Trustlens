import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailDocument extends Document {
  email: string;
  riskScore: number;
  riskLevel: string;
  checks: number;
  lastChecked: Date;
  createdAt: Date;
  updatedAt: Date;
}

const emailSchema = new Schema<IEmailDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  riskScore: { type: Number, default: 50 },
  riskLevel: { type: String, default: 'medium' },
  checks: { type: Number, default: 0 },
  lastChecked: { type: Date, default: Date.now },
}, { timestamps: true });

export const Email = mongoose.model<IEmailDocument>('Email', emailSchema);
