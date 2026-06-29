import { Request, Response, NextFunction } from 'express';
import { BlogPost } from '../models/BlogPost';

export async function getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;

    const filter: Record<string, unknown> = { published: true };
    if (category) filter.category = category;

    const [items, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      BlogPost.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }
    res.json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await BlogPost.distinct('category', { published: true });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
}
