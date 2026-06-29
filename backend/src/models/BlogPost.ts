import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogPostDocument extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  tags: string[];
  published: boolean;
  coverImage: string;
  publishedAt: Date;
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
  content: { type: String, required: true },
  excerpt: { type: String, required: true, maxlength: 500 },
  category: { type: String, default: 'General' },
  author: { type: String, default: 'TrustLens Team' },
  tags: { type: [String], default: [] },
  published: { type: Boolean, default: false },
  coverImage: { type: String, default: '' },
  publishedAt: { type: Date, default: Date.now },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
  },
}, { timestamps: true });

blogPostSchema.index({ published: 1, createdAt: -1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ category: 1 });

export const BlogPost = mongoose.model<IBlogPostDocument>('BlogPost', blogPostSchema);
