import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogPostDocument extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  isPublished: boolean;
  publishedAt: Date | null;
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPostDocument>({
  title: { type: String, required: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, index: true },
  excerpt: { type: String, required: true, maxlength: 500 },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  category: { type: String, required: true },
  tags: { type: [String], default: [] },
  author: { type: String, default: 'TrustLens Team' },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
  seo: {
    metaTitle: { type: String, required: true },
    metaDescription: { type: String, required: true },
    canonicalUrl: { type: String, default: '' },
  },
}, { timestamps: true });

blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1, isPublished: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ publishedAt: -1 });

export const BlogPost = mongoose.model<IBlogPostDocument>('BlogPost', blogPostSchema);
