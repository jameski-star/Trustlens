import { Request, Response, NextFunction } from 'express';
import { Report } from '../models/Report';
import { SearchHistory } from '../models/SearchHistory';
import { CommunityReport } from '../models/CommunityReport';
import { analyzeUrl, analyzeEmail, analyzePhoneNumber, calculateFinalScore, generateRecommendations } from '../services/scanner';
import { performAIAnalysis } from '../services/aiAnalysis';
import { generatePDF } from '../services/pdfGenerator';
import { logger } from '../utils/logger';

const communityTypeMap: Record<string, string[]> = {
  url: ['url'],
  email: ['email'],
  sms: ['phone', 'whatsapp'],
  phone: ['phone'],
  screenshot: [],
  qrcode: ['url'],
};

function communityTarget(input: string, scanType: string): string {
  const trimmed = input.trim().toLowerCase();
  if (scanType === 'url' || scanType === 'qrcode') {
    try {
      return new URL(trimmed).hostname.replace(/^www\./, '');
    } catch {
      return trimmed;
    }
  }
  if (scanType === 'email') {
    const parts = trimmed.split('@');
    return parts.length > 1 ? parts[1] : trimmed;
  }
  return trimmed.replace(/[\s\-().+]/g, '');
}

async function getCommunityScore(input: string, scanType: string): Promise<{ score: number; count: number }> {
  try {
    const types = communityTypeMap[scanType] || [];
    if (types.length === 0) return { score: 70, count: 0 };

    const target = communityTarget(input, scanType);
    const count = await CommunityReport.countDocuments({
      target: { $regex: target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
      type: { $in: types },
      status: 'published',
    });
    if (count >= 5) return { score: 15, count };
    if (count >= 3) return { score: 30, count };
    if (count >= 1) return { score: 45, count };
    return { score: 85, count: 0 };
  } catch {
    return { score: 70, count: 0 };
  }
}

function generateShareId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function scanUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { input } = req.body;

    const [analysis, aiResult, community] = await Promise.all([
      analyzeUrl(input),
      performAIAnalysis(input, 'url'),
      getCommunityScore(input, 'url'),
    ]);

    const finalScore = calculateFinalScore({
      ssl: analysis.ssl ? 80 : 30,
      domainAge: analysis.domainAge ? 60 : 30,
      blacklists: analysis.blacklists.filter(b => b.listed).length > 0 ? 20 : 80,
      aiAnalysis: aiResult.confidence,
      communityReports: community.score,
    });

    const riskLevel = finalScore >= 80 ? 'safe' : finalScore >= 60 ? 'low' : finalScore >= 40 ? 'medium' : finalScore >= 20 ? 'high' : 'critical';

    if (community.count > 0) {
      analysis.detectedRisks.push({
        category: 'Community Reports',
        severity: community.count >= 3 ? 'high' : 'medium',
        description: `This URL has been reported ${community.count} time${community.count > 1 ? 's' : ''} by the community as suspicious.`,
      });
    }

    const recommendations = generateRecommendations(analysis.detectedRisks, finalScore);

    const report = await Report.create({
      type: 'url',
      input: input.substring(0, 500),
      riskScore: finalScore,
      riskLevel,
      status: 'completed',
      summary: analysis.summary,
      details: {
        ssl: analysis.ssl,
        domainAge: analysis.domainAge,
        whois: analysis.whois,
        blacklists: analysis.blacklists,
        aiAnalysis: {
          summary: aiResult.summary,
          riskFactors: aiResult.riskFactors,
          confidence: aiResult.confidence,
          modelVersion: aiResult.modelVersion,
        },
        communityReports: community.count,
        detectedRisks: analysis.detectedRisks,
      },
      recommendations,
      confidenceScore: aiResult.confidence,
      shareId: generateShareId(),
    });

    await SearchHistory.create({
      query: input.substring(0, 200),
      type: 'url',
      resultId: report._id,
    });

    res.json({ success: true, data: { report } });
  } catch (error) {
    logger.error({ err: error }, 'Scan URL error');
    next(error);
  }
}

export async function scanEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { input } = req.body;

    const [aiResult, community] = await Promise.all([
      performAIAnalysis(input, 'email'),
      getCommunityScore(input, 'email'),
    ]);
    const analysis = analyzeEmail(input);

    const finalScore = calculateFinalScore({
      ssl: 0,
      domainAge: 0,
      blacklists: 0,
      aiAnalysis: aiResult.confidence,
      communityReports: community.score,
    });

    const riskLevel = finalScore >= 80 ? 'safe' : finalScore >= 60 ? 'low' : finalScore >= 40 ? 'medium' : finalScore >= 20 ? 'high' : 'critical';

    if (community.count > 0) {
      analysis.detectedRisks.push({
        category: 'Community Reports',
        severity: community.count >= 3 ? 'high' : 'medium',
        description: `This email has been reported ${community.count} time${community.count > 1 ? 's' : ''} by the community as suspicious.`,
      });
    }

    const recommendations = generateRecommendations(analysis.detectedRisks, finalScore);

    const report = await Report.create({
      type: 'email',
      input: input.substring(0, 500),
      riskScore: finalScore,
      riskLevel,
      status: 'completed',
      summary: analysis.summary,
      details: {
        ssl: null,
        domainAge: null,
        whois: null,
        blacklists: [],
        aiAnalysis: {
          summary: aiResult.summary,
          riskFactors: aiResult.riskFactors,
          confidence: aiResult.confidence,
          modelVersion: aiResult.modelVersion,
        },
        communityReports: community.count,
        detectedRisks: analysis.detectedRisks,
      },
      recommendations,
      confidenceScore: aiResult.confidence,
      shareId: generateShareId(),
    });

    await SearchHistory.create({
      query: input.substring(0, 200),
      type: 'email',
      resultId: report._id,
    });

    res.json({ success: true, data: { report } });
  } catch (error) {
    logger.error({ err: error }, 'Scan email error');
    next(error);
  }
}

export async function scanSms(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { input } = req.body;

    const [aiResult, community] = await Promise.all([
      performAIAnalysis(input, 'sms'),
      getCommunityScore(input, 'sms'),
    ]);
    const phoneAnalysis = analyzePhoneNumber(input);

    const finalScore = calculateFinalScore({
      ssl: 0,
      domainAge: 0,
      blacklists: 0,
      aiAnalysis: aiResult.confidence,
      communityReports: community.score,
    });

    const riskLevel = finalScore >= 80 ? 'safe' : finalScore >= 60 ? 'low' : finalScore >= 40 ? 'medium' : finalScore >= 20 ? 'high' : 'critical';

    if (community.count > 0) {
      phoneAnalysis.detectedRisks.push({
        category: 'Community Reports',
        severity: community.count >= 3 ? 'high' : 'medium',
        description: `This SMS number has been reported ${community.count} time${community.count > 1 ? 's' : ''} by the community as suspicious.`,
      });
    }

    const recommendations = generateRecommendations(phoneAnalysis.detectedRisks, finalScore);

    const report = await Report.create({
      type: 'sms',
      input: input.substring(0, 500),
      riskScore: finalScore,
      riskLevel,
      status: 'completed',
      summary: phoneAnalysis.summary,
      details: {
        ssl: null,
        domainAge: null,
        whois: null,
        blacklists: [],
        aiAnalysis: {
          summary: aiResult.summary,
          riskFactors: aiResult.riskFactors,
          confidence: aiResult.confidence,
          modelVersion: aiResult.modelVersion,
        },
        communityReports: community.count,
        detectedRisks: phoneAnalysis.detectedRisks,
      },
      recommendations,
      confidenceScore: aiResult.confidence,
      shareId: generateShareId(),
    });

    await SearchHistory.create({
      query: input.substring(0, 200),
      type: 'sms',
      resultId: report._id,
    });

    res.json({ success: true, data: { report } });
  } catch (error) {
    logger.error({ err: error }, 'Scan SMS error');
    next(error);
  }
}

export async function scanPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { input } = req.body;
    const analysis = analyzePhoneNumber(input);
    const community = await getCommunityScore(input, 'phone');

    const finalScore = Math.round(analysis.riskScore * 0.7 + community.score * 0.3);
    const riskLevel = finalScore >= 80 ? 'safe' : finalScore >= 60 ? 'low' : finalScore >= 40 ? 'medium' : finalScore >= 20 ? 'high' : 'critical';

    if (community.count > 0) {
      analysis.detectedRisks.push({
        category: 'Community Reports',
        severity: community.count >= 3 ? 'high' : 'medium',
        description: `This phone number has been reported ${community.count} time${community.count > 1 ? 's' : ''} by the community as suspicious.`,
      });
    }

    const recommendations = generateRecommendations(analysis.detectedRisks, finalScore);

    const report = await Report.create({
      type: 'phone',
      input: input.substring(0, 500),
      riskScore: finalScore,
      riskLevel,
      status: 'completed',
      summary: analysis.summary,
      details: {
        ssl: null,
        domainAge: null,
        whois: null,
        blacklists: [],
        aiAnalysis: null,
        communityReports: community.count,
        detectedRisks: analysis.detectedRisks,
      },
      recommendations,
      confidenceScore: 70,
      shareId: generateShareId(),
    });

    await SearchHistory.create({
      query: input.substring(0, 200),
      type: 'phone',
      resultId: report._id,
    });

    res.json({ success: true, data: { report } });
  } catch (error) {
    logger.error({ err: error }, 'Scan phone error');
    next(error);
  }
}

export async function getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { shareId } = req.params;
    const report = await Report.findOne({ shareId });

    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }

    res.json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
}

export async function downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { shareId } = req.params;
    const report = await Report.findOne({ shareId });

    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }

    generatePDF(res, {
      input: report.input,
      type: report.type,
      riskScore: report.riskScore,
      riskLevel: report.riskLevel,
      summary: report.summary,
      recommendations: report.recommendations,
      confidenceScore: report.confidenceScore,
      createdAt: report.createdAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecentSearches(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const recent = await SearchHistory.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('resultId');

    res.json({ success: true, data: { searches: recent } });
  } catch (error) {
    next(error);
  }
}

export async function getTrendingScams(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trendData = await SearchHistory.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({ success: true, data: { trends: trendData } });
  } catch (error) {
    next(error);
  }
}

export async function scanScreenshot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { input } = req.body;
    const aiResult = await performAIAnalysis(input || 'screenshot uploaded for analysis', 'screenshot');

    const finalScore = calculateFinalScore({
      ssl: 0,
      domainAge: 0,
      blacklists: 0,
      aiAnalysis: aiResult.confidence,
      communityReports: 50,
    });

    const riskLevel = finalScore >= 80 ? 'safe' : finalScore >= 60 ? 'low' : finalScore >= 40 ? 'medium' : finalScore >= 20 ? 'high' : 'critical';
    const recommendations = generateRecommendations(aiResult.riskFactors.map(r => ({ category: 'screenshot', severity: 'medium', description: r })), finalScore);

    const report = await Report.create({
      type: 'screenshot',
      input: (input || 'uploaded screenshot').substring(0, 500),
      riskScore: finalScore,
      riskLevel,
      status: 'completed',
      summary: aiResult.summary,
      details: {
        ssl: null,
        domainAge: null,
        whois: null,
        blacklists: [],
        aiAnalysis: {
          summary: aiResult.summary,
          riskFactors: aiResult.riskFactors,
          confidence: aiResult.confidence,
          modelVersion: aiResult.modelVersion,
        },
        communityReports: 0,
        detectedRisks: aiResult.riskFactors,
      },
      recommendations,
      confidenceScore: aiResult.confidence,
      shareId: generateShareId(),
    });

    res.json({ success: true, data: { report } });
  } catch (error) {
    logger.error({ err: error }, 'Scan screenshot error');
    next(error);
  }
}

export async function scanQrcode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { input } = req.body;
    const [analysis, aiResult, community] = await Promise.all([
      analyzeUrl(input),
      performAIAnalysis(input, 'url'),
      getCommunityScore(input, 'qrcode'),
    ]);

    const finalScore = calculateFinalScore({
      ssl: analysis.ssl ? 80 : 30,
      domainAge: analysis.domainAge ? 60 : 30,
      blacklists: analysis.blacklists.filter(b => b.listed).length > 0 ? 20 : 80,
      aiAnalysis: aiResult.confidence,
      communityReports: community.score,
    });

    const riskLevel = finalScore >= 80 ? 'safe' : finalScore >= 60 ? 'low' : finalScore >= 40 ? 'medium' : finalScore >= 20 ? 'high' : 'critical';

    if (community.count > 0) {
      analysis.detectedRisks.push({
        category: 'Community Reports',
        severity: community.count >= 3 ? 'high' : 'medium',
        description: `This URL (from QR code) has been reported ${community.count} time${community.count > 1 ? 's' : ''} by the community as suspicious.`,
      });
    }

    const recommendations = generateRecommendations(analysis.detectedRisks, finalScore);

    const report = await Report.create({
      type: 'qrcode',
      input: input.substring(0, 500),
      riskScore: finalScore,
      riskLevel,
      status: 'completed',
      summary: `QR code leads to: ${analysis.summary}`,
      details: {
        ssl: analysis.ssl,
        domainAge: analysis.domainAge,
        whois: analysis.whois,
        blacklists: analysis.blacklists,
        aiAnalysis: {
          summary: aiResult.summary,
          riskFactors: aiResult.riskFactors,
          confidence: aiResult.confidence,
          modelVersion: aiResult.modelVersion,
        },
        communityReports: community.count,
        detectedRisks: analysis.detectedRisks,
      },
      recommendations,
      confidenceScore: aiResult.confidence,
      shareId: generateShareId(),
    });

    await SearchHistory.create({
      query: input.substring(0, 200),
      type: 'qrcode',
      resultId: report._id,
    });

    res.json({ success: true, data: { report } });
  } catch (error) {
    logger.error({ err: error }, 'Scan QR code error');
    next(error);
  }
}
