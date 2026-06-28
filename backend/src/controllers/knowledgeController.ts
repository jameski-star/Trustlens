import { Request, Response, NextFunction } from 'express';
import { KnowledgeArticle } from '../models/KnowledgeArticle';

export async function getArticles(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const articles = await KnowledgeArticle.find({ isPublished: true }).sort({ order: 1 });
    res.json({ success: true, data: { items: articles } });
  } catch (error) {
    next(error);
  }
}

export async function getArticleBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const article = await KnowledgeArticle.findOne({ slug: req.params.slug, isPublished: true });
    if (!article) {
      res.status(404).json({ success: false, error: 'Article not found' });
      return;
    }
    res.json({ success: true, data: { article } });
  } catch (error) {
    next(error);
  }
}
