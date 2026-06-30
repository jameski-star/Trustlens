import { Request, Response, NextFunction } from 'express';
import { CommunityReport } from '../models/CommunityReport';
import { analyzeUrl, analyzeEmail, analyzePhoneNumber, analyzeSmsContent, calculateFinalScore } from '../services/scanner';
import { performAIAnalysis } from '../services/aiAnalysis';

const COMMUNITY_TYPE_MAP: Record<string, string[]> = {
  url: ['url'],
  email: ['email'],
  phone: ['phone', 'whatsapp'],
  whatsapp: ['phone', 'whatsapp'],
};

function communityTarget(input: string, scanType: string): string {
  const trimmed = input.trim().toLowerCase();
  if (scanType === 'url') {
    try { return new URL(trimmed).hostname.replace(/^www\./, ''); }
    catch { return trimmed; }
  }
  if (scanType === 'email') {
    const parts = trimmed.split('@');
    return parts.length > 1 ? parts[1] : trimmed;
  }
  return trimmed.replace(/[\s\-().+]/g, '');
}

async function getCommunityScore(input: string, scanType: string): Promise<{ score: number; count: number; malicious: number; safe: number }> {
  try {
    const types = COMMUNITY_TYPE_MAP[scanType] || [];
    if (types.length === 0) return { score: 70, count: 0, malicious: 0, safe: 0 };
    const target = communityTarget(input, scanType);
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = { target: { $regex: escaped, $options: 'i' }, type: { $in: types }, status: { $in: ['published', 'scam_alert'] as const } };
    const [total, malicious] = await Promise.all([
      CommunityReport.countDocuments(filter),
      CommunityReport.countDocuments({ ...filter, category: 'malicious' }),
    ]);
    let score: number;
    if (malicious >= 3) score = 0;
    else if (malicious >= 1) score = 10;
    else if (total >= 5) score = 20;
    else if (total >= 3) score = 30;
    else if (total >= 1) score = 45;
    else score = 90;
    return { score, count: total, malicious, safe: 0 };
  } catch {
    return { score: 70, count: 0, malicious: 0, safe: 0 };
  }
}

function getRiskLevel(score: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'safe';
  if (score >= 60) return 'low';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'high';
  return 'critical';
}

const SCAN_TYPE_MAP: Record<string, 'url' | 'email' | 'phone' | 'sms'> = {
  url: 'url',
  email: 'email',
  phone: 'phone',
  whatsapp: 'phone',
};

async function runAutomatedScan(target: string, type: string): Promise<{ riskScore: number; riskLevel: string; summary: string } | null> {
  try {
    const scanType = SCAN_TYPE_MAP[type];
    if (!scanType) return null;

    let riskScore = 50;
    let summary = '';

    if (scanType === 'url') {
      const [analysis, community, aiResult] = await Promise.all([
        analyzeUrl(target),
        getCommunityScore(target, 'url'),
        performAIAnalysis(target, 'url'),
      ]);
      const domainAgeScore = analysis.domainAge?.daysSinceCreation
        ? analysis.domainAge.daysSinceCreation > 365 ? 80 : analysis.domainAge.daysSinceCreation > 30 ? 50 : 20
        : 30;
      const blacklistScore = analysis.blacklists.some((b: { listed: boolean }) => b.listed) ? 5 : 80;
      riskScore = calculateFinalScore({
        ssl: analysis.ssl ? 50 : 20,
        domainAge: domainAgeScore,
        blacklists: blacklistScore,
        aiAnalysis: aiResult.confidence,
        communityReports: community.score,
      });
      summary = analysis.summary;
    } else if (scanType === 'email') {
      const [community, aiResult] = await Promise.all([
        getCommunityScore(target, 'email'),
        performAIAnalysis(target, 'email'),
      ]);
      riskScore = Math.round(50 * 0.05 + 30 * 0.10 + 80 * 0.30 + aiResult.confidence * 0.15 + community.score * 0.40);
      summary = aiResult.summary || `Scanned email: ${target}`;
    } else if (scanType === 'phone') {
      const analysis = analyzePhoneNumber(target);
      const [community, aiResult] = await Promise.all([
        getCommunityScore(target, 'phone'),
        performAIAnalysis(target, 'phone'),
      ]);
      riskScore = Math.round(analysis.riskScore * 0.4 + community.score * 0.3 + aiResult.confidence * 0.3);
      summary = analysis.summary;
    } else if (scanType === 'sms') {
      const analysis = analyzeSmsContent(target);
      const [community, aiResult] = await Promise.all([
        getCommunityScore(target, 'sms'),
        performAIAnalysis(target, 'sms'),
      ]);
      riskScore = Math.round(analysis.riskScore * 0.50 + community.score * 0.25 + aiResult.confidence * 0.25);
      summary = analysis.summary;
    }

    const riskLevel = getRiskLevel(riskScore);
    return { riskScore, riskLevel, summary };
  } catch {
    return null;
  }
}

export async function createReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const screenshots: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        screenshots.push(`/api/v1/uploads/${file.filename}`);
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
      scanStatus: 'scanning',
    });

    runAutomatedScan(req.body.target, req.body.type).then(async (result) => {
      if (result) {
        await CommunityReport.findByIdAndUpdate(report._id, {
          scanStatus: 'completed',
          scanResult: result,
        });
      } else {
        await CommunityReport.findByIdAndUpdate(report._id, { scanStatus: 'failed' });
      }
    }).catch(async () => {
      await CommunityReport.findByIdAndUpdate(report._id, { scanStatus: 'failed' });
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
    else filter.status = { $in: ['published', 'scam_alert'] };
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

async function handleVote(req: Request, res: Response, next: NextFunction, voteType: 'up' | 'down'): Promise<void> {
  try {
    const { id } = req.params;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

    const report = await CommunityReport.findById(id);
    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }

    const existingVote = report.voters.get(ip);

    if (existingVote === voteType) {
      res.status(409).json({ success: false, error: 'You have already voted this way' });
      return;
    }

    if (existingVote === 'up' && voteType === 'down') {
      report.upvotes = Math.max(0, report.upvotes - 1);
      report.downvotes += 1;
    } else if (existingVote === 'down' && voteType === 'up') {
      report.downvotes = Math.max(0, report.downvotes - 1);
      report.upvotes += 1;
    } else {
      if (voteType === 'up') report.upvotes += 1;
      else report.downvotes += 1;
    }

    report.voters.set(ip, voteType);
    await report.save();

    res.json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
}

export async function upvoteReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  return handleVote(req, res, next, 'up');
}

export async function downvoteReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  return handleVote(req, res, next, 'down');
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
