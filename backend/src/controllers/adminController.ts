import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Report } from '../models/Report';
import { CommunityReport } from '../models/CommunityReport';
import { BlogPost } from '../models/BlogPost';
import { SearchHistory } from '../models/SearchHistory';
import { logger } from '../utils/logger';

export async function getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [totalUsers, totalScans, totalReports, totalPosts, scansToday] = await Promise.all([
      User.countDocuments(),
      Report.countDocuments(),
      CommunityReport.countDocuments({ status: 'published' }),
      BlogPost.countDocuments(),
      Report.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalUsers, totalScans, totalReports, totalPosts, scansToday },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: { items: users, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function moderateReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [reports, total] = await Promise.all([
      CommunityReport.find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      CommunityReport.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      success: true,
      data: { items: reports, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReportStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await CommunityReport.findByIdAndUpdate(id, { status }, { new: true });
    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }
    res.json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
}

export async function createBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await BlogPost.create({
      ...req.body,
      publishedAt: req.body.isPublished ? new Date() : null,
    });
    res.status(201).json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
}

export async function updateBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.isPublished && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }
    const post = await BlogPost.findByIdAndUpdate(id, updateData, { new: true });
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }
    res.json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
}

export async function getAdminBlogPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.json({ success: true, data: { items: posts } });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [dailyScans, reportByType, popularSearches] = await Promise.all([
      Report.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Report.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      SearchHistory.aggregate([
        { $group: { _id: '$query', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
    ]);

    res.json({
      success: true,
      data: { dailyScans, reportByType, popularSearches },
    });
  } catch (error) {
    next(error);
  }
}
