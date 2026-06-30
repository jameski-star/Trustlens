import mongoose, { Schema, Document } from 'mongoose';

interface ScoreFactor {
  label: string;
  score: number;
  weight: number;
  contribution: number;
}

export interface IReport extends Document {
  type: 'url' | 'email' | 'sms' | 'phone' | 'screenshot' | 'qrcode';
  input: string;
  riskScore: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  status: 'completed' | 'pending' | 'failed';
  summary: string;
  details: Record<string, unknown>;
  recommendations: string[];
  confidenceScore: number;
  shareId: string;
  scoreBreakdown?: ScoreFactor[];
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  type: { type: String, enum: ['url', 'email', 'sms', 'phone', 'screenshot', 'qrcode'], required: true },
  input: { type: String, required: true, maxlength: 500 },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  riskLevel: { type: String, enum: ['safe', 'low', 'medium', 'high', 'critical'], required: true },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
  summary: { type: String, default: '' },
  details: { type: Schema.Types.Mixed, default: {} },
  recommendations: [{ type: String }],
  confidenceScore: { type: Number, default: 70 },
  shareId: { type: String, unique: true, required: true },
  scoreBreakdown: [{ label: String, score: Number, weight: Number, contribution: Number }],
}, { timestamps: true });

ReportSchema.index({ type: 1, createdAt: -1 });
ReportSchema.index({ riskLevel: 1 });
ReportSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);
