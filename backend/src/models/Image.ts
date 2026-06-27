import mongoose, { Document, Schema } from 'mongoose';

export interface IImageDocument extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  ocrResult: string | null;
  riskScore: number | null;
  userId: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const imageSchema = new Schema<IImageDocument>({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  ocrResult: { type: String, default: null },
  riskScore: { type: Number, default: null },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

export const Image = mongoose.model<IImageDocument>('Image', imageSchema);
