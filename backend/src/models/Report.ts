import mongoose, { Document, Schema } from 'mongoose';

export interface IReportDocument extends Document {
  type: 'url' | 'email' | 'sms' | 'phone' | 'screenshot' | 'qrcode';
  input: string;
  riskScore: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  status: 'completed' | 'pending' | 'failed';
  summary: string;
  details: {
    ssl: {
      valid: boolean;
      issuer: string;
      expiresAt: Date;
      daysRemaining: number;
    } | null;
    domainAge: {
      created: Date;
      daysSinceCreation: number;
      monthsSinceCreation: number;
    } | null;
    whois: {
      registrar: string;
      creationDate: Date;
      expirationDate: Date;
      lastUpdated: Date;
      country: string;
      organization: string;
    } | null;
    blacklists: Array<{
      name: string;
      listed: boolean;
      source: string;
    }>;
    aiAnalysis: {
      summary: string;
      riskFactors: string[];
      confidence: number;
      modelVersion: string;
    } | null;
    communityReports: number;
    detectedRisks: Array<{
      category: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
    }>;
  };
  recommendations: string[];
  confidenceScore: number;
  userId: mongoose.Types.ObjectId | null;
  shareId: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReportDocument>({
  type: {
    type: String,
    enum: ['url', 'email', 'sms', 'phone', 'screenshot', 'qrcode'],
    required: true,
  },
  input: {
    type: String,
    required: true,
    index: true,
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  riskLevel: {
    type: String,
    enum: ['safe', 'low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'pending',
  },
  summary: { type: String, default: '' },
  details: {
    ssl: { type: Schema.Types.Mixed, default: null },
    domainAge: { type: Schema.Types.Mixed, default: null },
    whois: { type: Schema.Types.Mixed, default: null },
    blacklists: { type: [Schema.Types.Mixed], default: [] },
    aiAnalysis: { type: Schema.Types.Mixed, default: null },
    communityReports: { type: Number, default: 0 },
    detectedRisks: { type: [Schema.Types.Mixed], default: [] },
  },
  recommendations: { type: [String], default: [] },
  confidenceScore: { type: Number, default: 0 },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  shareId: { type: String, unique: true, required: true, index: true },
}, {
  timestamps: true,
});

reportSchema.index({ createdAt: -1 });
reportSchema.index({ type: 1, createdAt: -1 });

export const Report = mongoose.model<IReportDocument>('Report', reportSchema);
