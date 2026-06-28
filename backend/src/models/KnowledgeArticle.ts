import mongoose, { Document, Schema } from 'mongoose';

export interface IKnowledgeArticleDocument extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  icon: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const knowledgeArticleSchema = new Schema<IKnowledgeArticleDocument>({
  title: { type: String, required: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true, maxlength: 500 },
  content: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, default: 'BookOpen' },
  order: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

knowledgeArticleSchema.index({ category: 1, order: 1 });

export const KnowledgeArticle = mongoose.model<IKnowledgeArticleDocument>('KnowledgeArticle', knowledgeArticleSchema);
