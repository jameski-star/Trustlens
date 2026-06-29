import { Request, Response, NextFunction } from 'express';
import { CommunityReport } from '../models/CommunityReport';
export async function createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const screenshots: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        screenshots.push(`/uploads/${file.filename}`);
      }
    }
    const report = await CommunityReport.create({ ...req.body, screenshots });
    res.status(201).json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
}

export async function getReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const category = req.query.category as string;

    const filter: Record<string, unknown> = { status: 'published' };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (req.query.minReports) filter.reports = { $gte: parseInt(req.query.minReports as string) };

    const [items, total] = await Promise.all([
      CommunityReport.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      CommunityReport.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function upvoteReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const report = await CommunityReport.findByIdAndUpdate(
      id,
      { $inc: { reports: 1 } },
      { new: true }
    );
    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }
    res.json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
}

export async function getReportById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const report = await CommunityReport.findById(req.params.id);
    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }
    res.json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
}

export async function getReportStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [totalReports, byType] = await Promise.all([
      CommunityReport.countDocuments({ status: 'published' }),
      CommunityReport.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalReports,
        byType,
      },
    });
  } catch (error) {
    next(error);
  }
}
