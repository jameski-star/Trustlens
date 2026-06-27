import mongoose, { Document, Schema } from 'mongoose';

export interface IPhoneDocument extends Document {
  phone: string;
  riskScore: number;
  riskLevel: string;
  checks: number;
  lastChecked: Date;
  createdAt: Date;
  updatedAt: Date;
}

const phoneSchema = new Schema<IPhoneDocument>({
  phone: { type: String, required: true, unique: true, index: true },
  riskScore: { type: Number, default: 50 },
  riskLevel: { type: String, default: 'medium' },
  checks: { type: Number, default: 0 },
  lastChecked: { type: Date, default: Date.now },
}, { timestamps: true });

export const PhoneNumber = mongoose.model<IPhoneDocument>('PhoneNumber', phoneSchema);
