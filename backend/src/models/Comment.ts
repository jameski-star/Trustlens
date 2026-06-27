import mongoose, { Document, Schema } from 'mongoose';

export interface ICommentDocument extends Document {
  postId: mongoose.Types.ObjectId;
  author: string;
  email: string;
  content: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<ICommentDocument>({
  postId: { type: Schema.Types.ObjectId, ref: 'BlogPost', required: true, index: true },
  author: { type: String, required: true },
  email: { type: String, required: true },
  content: { type: String, required: true, maxlength: 2000 },
  isApproved: { type: Boolean, default: false },
}, { timestamps: true });

export const Comment = mongoose.model<ICommentDocument>('Comment', commentSchema);
