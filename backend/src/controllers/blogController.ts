import { Request, Response, NextFunction } from 'express';
import { BlogPost } from '../models/BlogPost';
import { Comment } from '../models/Comment';
export async function getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;

    const filter: Record<string, unknown> = { isPublished: true };
    if (category) filter.category = category;

    const [items, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ publishedAt: -1 })
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
    const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true });
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
    const categories = await BlogPost.distinct('category', { isPublished: true });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
}

export async function getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const comments = await Comment.find({ postId: req.params.postId, isApproved: true })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: { comments } });
  } catch (error) {
    next(error);
  }
}

export async function createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const comment = await Comment.create({
      postId: req.params.postId,
      ...req.body,
    });
    res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    next(error);
  }
}
