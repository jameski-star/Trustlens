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
    const report = await CommunityReport.create({
      ...req.body,
      screenshots,
      title: req.body.title || `Report: ${req.body.target}`,
      category: req.body.category || 'Other',
      status: 'pending',
      upvotes: 0,
      downvotes: 0,
      reports: 1,
      isVerified: false,
    });
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
    const status = req.query.status as string;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    else filter.status = 'published';
    if (type) filter.type = type;
    if (category) filter.category = category;

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
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }

    if (report.upvotes >= 5 && report.status !== 'scam_alert') {
      report.status = 'scam_alert';
      await report.save();
    }

    res.json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
}

export async function downvoteReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const report = await CommunityReport.findByIdAndUpdate(
      id,
      { $inc: { downvotes: 1 } },
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
    const [publishedReports, scamAlerts, byType] = await Promise.all([
      CommunityReport.countDocuments({ status: 'published' }),
      CommunityReport.countDocuments({ status: 'scam_alert' }),
      CommunityReport.aggregate([
        { $match: { status: { $in: ['published', 'scam_alert'] } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalReports: publishedReports + scamAlerts,
        scamAlerts,
        byType,
      },
    });
  } catch (error) {
    next(error);
  }
}
