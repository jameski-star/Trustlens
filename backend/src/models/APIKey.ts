import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IAPIKeyDocument extends Document {
  key: string;
  name: string;
  userId: mongoose.Types.ObjectId;
  permissions: string[];
  isActive: boolean;
  lastUsed: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IAPIKeyDocument>({
  key: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  permissions: { type: [String], default: ['scan'] },
  isActive: { type: Boolean, default: true },
  lastUsed: { type: Date, default: null },
}, { timestamps: true });

apiKeySchema.pre('save', function(next) {
  if (!this.key) {
    this.key = `tl_${crypto.randomBytes(32).toString('hex')}`;
  }
  next();
});

export const APIKey = mongoose.model<IAPIKeyDocument>('APIKey', apiKeySchema);
