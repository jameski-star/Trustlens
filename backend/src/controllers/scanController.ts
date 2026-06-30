import { Request, Response, NextFunction } from 'express';
import { Report } from '../models/Report';
import { SearchHistory } from '../models/SearchHistory';
import { CommunityReport } from '../models/CommunityReport';
import { analyzeUrl, analyzeEmail, analyzePhoneNumber, analyzeSmsContent, calculateFinalScore, generateRecommendations } from '../services/scanner';
import { performAIAnalysis } from '../services/aiAnalysis';
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

async function getCommunityScore(input: string, scanType: string): Promise<{ score: number; count: number; malicious: number; safe: number }> {
  try {
    const types = communityTypeMap[scanType] || [];
    if (types.length === 0) return { score: 70, count: 0, malicious: 0, safe: 0 };

    const target = communityTarget(input, scanType);
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = { target: { $regex: escaped, $options: 'i' }, type: { $in: types }, status: 'published' };

    const [total, malicious, safe] = await Promise.all([
      CommunityReport.countDocuments(filter),
      CommunityReport.countDocuments({ ...filter, category: 'malicious' }),
      CommunityReport.countDocuments({ ...filter, category: 'safe' }),
    ]);

    let score: number;
    if (malicious >= 3) score = 5;
    else if (malicious >= 1) score = 15;
    else if (safe >= 3) score = 85;
    else if (total >= 5) score = 30;
    else if (total >= 3) score = 40;
    else if (total >= 1) score = 55;
    else score = 85;

    return { score, count: total, malicious, safe };
  } catch {
    return { score: 70, count: 0, malicious: 0, safe: 0 };
  }
}

function generateShareId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getRiskLevel(finalScore: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
  if (finalScore >= 80) return 'safe';
  if (finalScore >= 60) return 'low';
  if (finalScore >= 40) return 'medium';
  if (finalScore >= 20) return 'high';
  return 'critical';
}

export async function scanUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { input } = req.body;

    const [analysis, community, aiResult] = await Promise.all([
      analyzeUrl(input),
      getCommunityScore(input, 'url'),
      performAIAnalysis(input, 'url'),
    ]);

    const finalScore = calculateFinalScore({
      ssl: analysis.ssl ? 80 : 30,
      domainAge: analysis.domainAge ? 60 : 30,
      blacklists: analysis.blacklists.filter(b => b.listed).length > 0 ? 20 : 80,
      aiAnalysis: aiResult.confidence,
      communityReports: community.score,
    });

    const riskLevel = getRiskLevel(finalScore);

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
        communityReports: community,
        siteScrape: analysis.siteScrape,
        aiAnalysis: {
          summary: aiResult.summary,
          riskFactors: aiResult.riskFactors,
          confidence: aiResult.confidence,
          modelVersion: aiResult.modelVersion,
        },
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

    const [community, aiResult] = await Promise.all([
      getCommunityScore(input, 'email'),
      performAIAnalysis(input, 'email'),
    ]);
    const analysis = analyzeEmail(input);

    const finalScore = calculateFinalScore({
      ssl: 0,
      domainAge: 0,
      blacklists: 0,
      aiAnalysis: aiResult.confidence,
      communityReports: community.score,
    });

    const riskLevel = getRiskLevel(finalScore);

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

    const [community, aiResult] = await Promise.all([
      getCommunityScore(input, 'sms'),
      performAIAnalysis(input, 'sms'),
    ]);
    const smsAnalysis = analyzeSmsContent(input);

    const finalScore = Math.round(
      smsAnalysis.riskScore * 0.50 + community.score * 0.25 + aiResult.confidence * 0.25
    );

    const riskLevel = getRiskLevel(finalScore);

    if (community.count > 0) {
      smsAnalysis.detectedRisks.push({
        category: 'Community Reports',
        severity: community.count >= 3 ? 'high' : 'medium',
        description: `This content has been reported ${community.count} time${community.count > 1 ? 's' : ''} by the community as suspicious.`,
      });
    }

    const recommendations = generateRecommendations(smsAnalysis.detectedRisks, finalScore);

    const report = await Report.create({
      type: 'sms',
      input: input.substring(0, 500),
      riskScore: finalScore,
      riskLevel,
      status: 'completed',
      summary: smsAnalysis.summary,
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
        detectedRisks: smsAnalysis.detectedRisks,
        scamPatterns: smsAnalysis.detectedRisks.filter(r => r.category === 'Scam Pattern').map(r => r.description),
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
    const [community, aiResult] = await Promise.all([
      getCommunityScore(input, 'phone'),
      performAIAnalysis(input, 'phone'),
    ]);

    const finalScore = Math.round(analysis.riskScore * 0.4 + community.score * 0.3 + aiResult.confidence * 0.3);
    const riskLevel = getRiskLevel(finalScore);

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
      type: 'phone',
      resultId: report._id,
    });

    res.json({ success: true, data: { report } });
  } catch (error) {
    logger.error({ err: error }, 'Scan phone error');
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

    const riskLevel = getRiskLevel(finalScore);
    const recommendations = generateRecommendations(aiResult.riskFactors.map(r => ({ category: 'screenshot', severity: 'medium' as const, description: r })), finalScore);

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
    const [analysis, community, aiResult] = await Promise.all([
      analyzeUrl(input),
      getCommunityScore(input, 'qrcode'),
      performAIAnalysis(input, 'url'),
    ]);

    const finalScore = calculateFinalScore({
      ssl: analysis.ssl ? 80 : 30,
      domainAge: analysis.domainAge ? 60 : 30,
      blacklists: analysis.blacklists.filter(b => b.listed).length > 0 ? 20 : 80,
      aiAnalysis: aiResult.confidence,
      communityReports: community.score,
    });

    const riskLevel = getRiskLevel(finalScore);

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
