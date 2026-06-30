import { Request, Response, NextFunction } from 'express';
import { Report } from '../models/Report';
import { SearchHistory } from '../models/SearchHistory';
import { CommunityReport } from '../models/CommunityReport';
import { analyzeUrl, analyzeEmail, analyzePhoneNumber, analyzeSmsContent, calculateFinalScore, generateRecommendations } from '../services/scanner';
import { getPhoneIntel } from '../services/phoneIntel';
import { isOfficialNumber, isImpersonatingOfficial } from '../services/knownContacts';
import { performAIAnalysis } from '../services/aiAnalysis';
import { analyzeScreenshot } from '../services/screenshotAnalysis';
import { comprehensiveWhois } from '../services/whoisFallback';
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
    const filter = { target: { $regex: escaped, $options: 'i' }, type: { $in: types }, status: { $in: ['published', 'scam_alert'] } };

    const [total, malicious, safe] = await Promise.all([
      CommunityReport.countDocuments(filter),
      CommunityReport.countDocuments({ ...filter, category: 'malicious' }),
      CommunityReport.countDocuments({ ...filter, category: 'safe' }),
    ]);

    let score: number;
    if (malicious >= 3) score = 0;
    else if (malicious >= 1) score = 10;
    else if (safe >= 3) score = 100;
    else if (total >= 5) score = 20;
    else if (total >= 3) score = 30;
    else if (total >= 1) score = 45;
    else score = 90;

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

    const domainAgeScore = analysis.domainAge?.daysSinceCreation
      ? analysis.domainAge.daysSinceCreation > 365 ? 80 : analysis.domainAge.daysSinceCreation > 30 ? 50 : 20
      : 30;

    const scoreFactors = {
      ssl: { score: analysis.ssl ? 50 : 20, weight: 0.05, label: 'SSL Certificate' },
      domainAge: { score: domainAgeScore, weight: 0.10, label: 'Domain Age' },
      blacklists: { score: analysis.blacklists.some(b => b.listed) ? 5 : 80, weight: 0.30, label: 'Blacklist Status' },
      aiAnalysis: { score: aiResult.confidence, weight: 0.15, label: 'AI Analysis' },
      communityReports: { score: community.score, weight: 0.40, label: 'Community Reports' },
    };

    const finalScore = calculateFinalScore({
      ssl: scoreFactors.ssl.score,
      domainAge: scoreFactors.domainAge.score,
      blacklists: scoreFactors.blacklists.score,
      aiAnalysis: scoreFactors.aiAnalysis.score,
      communityReports: scoreFactors.communityReports.score,
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

    const [community, aiResult, whoisResult] = await Promise.all([
      getCommunityScore(input, 'email'),
      performAIAnalysis(input, 'email'),
      (async () => {
        const parts = input.split('@');
        if (parts.length !== 2) return null;
        try {
          const result = await comprehensiveWhois(parts[1]);
          return result;
        } catch { return null; }
      })(),
    ]);
    const analysis = analyzeEmail(input);

    if (whoisResult?.domainAge) {
      const { daysSinceCreation } = whoisResult.domainAge;
      analysis.detectedRisks.push({
        category: 'Domain Age',
        severity: daysSinceCreation < 30 ? 'high' : daysSinceCreation < 90 ? 'medium' : 'low',
        description: daysSinceCreation < 30
          ? `Email domain was registered only ${daysSinceCreation} day${daysSinceCreation === 1 ? '' : 's'} ago — very new domains are frequently used for phishing.`
          : daysSinceCreation < 90
            ? `Email domain is ${daysSinceCreation} days old — relatively new.`
            : `Email domain is ${daysSinceCreation} days old — established domain.`,
      });
      if (daysSinceCreation < 30) analysis.detectedRisks[analysis.detectedRisks.length - 1].severity = 'high';
    }

    const emailDomainAgeScore = whoisResult?.domainAge?.daysSinceCreation
      ? whoisResult.domainAge.daysSinceCreation > 365 ? 80 : whoisResult.domainAge.daysSinceCreation > 30 ? 50 : 20
      : 30;

    const emailScoreFactors = {
      ssl: { score: 50, weight: 0.05, label: 'Email Authentication' },
      domainAge: { score: emailDomainAgeScore, weight: 0.10, label: 'Domain Age' },
      blacklists: { score: 80, weight: 0.30, label: 'General Reputation' },
      aiAnalysis: { score: aiResult.confidence, weight: 0.15, label: 'AI Analysis' },
      communityReports: { score: community.score, weight: 0.40, label: 'Community Reports' },
    };

    const finalScore = calculateFinalScore({
      ssl: emailScoreFactors.ssl.score,
      domainAge: emailScoreFactors.domainAge.score,
      blacklists: emailScoreFactors.blacklists.score,
      aiAnalysis: emailScoreFactors.aiAnalysis.score,
      communityReports: emailScoreFactors.communityReports.score,
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
      scoreBreakdown: Object.values(emailScoreFactors).map(f => ({ label: f.label, score: f.score, weight: f.weight, contribution: Math.round(f.score * f.weight) })),
      status: 'completed',
      summary: analysis.summary,
      details: {
        ssl: null,
        domainAge: whoisResult?.domainAge ?? null,
        whois: whoisResult?.whois ?? null,
        blacklists: [],
        aiAnalysis: {
          summary: aiResult.summary,
          riskFactors: aiResult.riskFactors,
          confidence: aiResult.confidence,
          modelVersion: aiResult.modelVersion,
        },
        communityReports: community.count,
        detectedRisks: analysis.detectedRisks,
        organization: (analysis as any).organization,
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

    let phoneInfo: { provider?: string; country?: string; isVirtual: boolean; organization?: string } | null = null;
    const phoneMatch = input.match(/\+?\d[\d\-().\s]{7,15}/);
    if (phoneMatch) {
      const phoneNumber = phoneMatch[0];
      const intel = getPhoneIntel(phoneNumber);
      phoneInfo = { provider: intel.provider, country: intel.country?.name, isVirtual: intel.isVirtual };
      if (intel.isVirtual) {
        smsAnalysis.detectedRisks.push({
          category: 'Virtual Number',
          severity: 'medium',
          description: 'Phone number in SMS appears to be a virtual/VoIP/disposable number — often used by scammers.',
        });
      }
      if (intel.country) {
        smsAnalysis.detectedRisks.push({
          category: 'Phone Location',
          severity: 'low',
          description: `Phone country: ${intel.country.name} (${intel.country.region}).`,
        });
      }
      if (intel.provider) {
        smsAnalysis.detectedRisks.push({
          category: 'Phone Provider',
          severity: 'low',
          description: `Phone provider: ${intel.provider}.`,
        });
      }
      const officialCheck = isOfficialNumber(phoneNumber);
      if (officialCheck.official) {
        phoneInfo.organization = officialCheck.contact?.name;
        smsAnalysis.detectedRisks.push({
          category: 'Official Contact',
          severity: 'low',
          description: `This number belongs to ${officialCheck.contact?.name} (${officialCheck.match} match).`,
        });
      }
      const impersonationCheck = isImpersonatingOfficial(phoneNumber);
      if (impersonationCheck.impersonating) {
        smsAnalysis.detectedRisks.push({
          category: 'Impersonation Alert',
          severity: 'critical',
          description: impersonationCheck.details,
        });
      }
    }

    const smsScoreFactors = {
      contentAnalysis: { score: smsAnalysis.riskScore, weight: 0.50, label: 'Content Pattern Analysis' },
      communityReports: { score: community.score, weight: 0.25, label: 'Community Reports' },
      aiAnalysis: { score: aiResult.confidence, weight: 0.25, label: 'AI Analysis' },
    };

    const finalScore = Math.round(
      smsScoreFactors.contentAnalysis.score * smsScoreFactors.contentAnalysis.weight +
      smsScoreFactors.communityReports.score * smsScoreFactors.communityReports.weight +
      smsScoreFactors.aiAnalysis.score * smsScoreFactors.aiAnalysis.weight
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
      scoreBreakdown: Object.values(smsScoreFactors).map(f => ({ label: f.label, score: f.score, weight: f.weight, contribution: Math.round(f.score * f.weight) })),
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
        phoneInfo,
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

    const phoneScoreFactors = {
      numberAnalysis: { score: analysis.riskScore, weight: 0.40, label: 'Number Pattern Analysis' },
      communityReports: { score: community.score, weight: 0.30, label: 'Community Reports' },
      aiAnalysis: { score: aiResult.confidence, weight: 0.30, label: 'AI Analysis' },
    };

    const finalScore = Math.round(
      phoneScoreFactors.numberAnalysis.score * phoneScoreFactors.numberAnalysis.weight +
      phoneScoreFactors.communityReports.score * phoneScoreFactors.communityReports.weight +
      phoneScoreFactors.aiAnalysis.score * phoneScoreFactors.aiAnalysis.weight
    );
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
      scoreBreakdown: Object.values(phoneScoreFactors).map(f => ({ label: f.label, score: f.score, weight: f.weight, contribution: Math.round(f.score * f.weight) })),
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
        phoneInfo: {
          provider: (analysis as any).provider,
          country: (analysis as any).country,
          isVirtual: (analysis as any).isVirtual,
          organization: (analysis as any).organization,
        },
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

    let summary = '';
    let riskScore = 50;
    let riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let detectedRisks: Array<{ category: string; severity: string; description: string }> = [];
    let details: Record<string, unknown> = {};

    if (input && input.length > 100) {
      const result = await analyzeScreenshot(input);
      detectedRisks = result.detectedRisks;
      riskScore = result.overallRisk;
      riskLevel = getRiskLevel(riskScore);
      summary = result.extracted.fullText.length > 0
        ? `Found ${result.extracted.urls.length} URL(s), ${result.extracted.emails.length} email(s), ${result.extracted.phones.length} phone number(s), ${result.extracted.scamPatterns.length} scam pattern(s).`
        : 'No readable text could be extracted from this image.';

      details = {
        ssl: null,
        domainAge: null,
        whois: null,
        blacklists: [],
        aiAnalysis: { summary: result.aiSummary, riskFactors: detectedRisks.map(r => r.description), confidence: riskScore, modelVersion: 'trustlens-ocr-v1.0' },
        communityReports: 0,
        detectedRisks,
        ocrText: result.extracted.fullText.substring(0, 2000),
        urlsFound: result.urlResults,
        emailsFound: result.emailResults,
        phonesFound: result.phoneResults,
        scamPatterns: result.extracted.scamPatterns,
      };
    } else {
      summary = 'No image data provided for analysis.';
      riskLevel = 'low';
      details = {
        ssl: null, domainAge: null, whois: null, blacklists: [],
        aiAnalysis: { summary, riskFactors: [], confidence: 50, modelVersion: 'trustlens-ocr-v1.0' },
        communityReports: 0, detectedRisks: [],
      };
    }

    const recommendations = generateRecommendations(
      detectedRisks.map(r => ({ category: r.category, severity: r.severity as 'low' | 'medium' | 'high' | 'critical', description: r.description })),
      riskScore
    );

    const screenshotBreakdown = [
      { label: 'OCR Text Analysis', score: detectedRisks.length > 0 ? Math.max(10, 100 - detectedRisks.length * 20) : 80, weight: 0.40, contribution: 0 },
      { label: 'URL Risk Assessment', score: riskScore, weight: 0.30, contribution: 0 },
      { label: 'Scam Pattern Match', score: detectedRisks.length > 0 ? 20 : 80, weight: 0.30, contribution: 0 },
    ].map(f => ({ ...f, contribution: Math.round(f.score * f.weight) }));

    const report = await Report.create({
      type: 'screenshot',
      input: (input || 'uploaded screenshot').substring(0, 500),
      riskScore,
      riskLevel,
      scoreBreakdown: screenshotBreakdown,
      status: 'completed',
      summary,
      details,
      recommendations,
      confidenceScore: riskScore,
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

    const qrDomainAgeScore = analysis.domainAge?.daysSinceCreation
      ? analysis.domainAge.daysSinceCreation > 365 ? 80 : analysis.domainAge.daysSinceCreation > 30 ? 50 : 20
      : 30;

    const qrScoreFactors = {
      ssl: { score: analysis.ssl ? 50 : 20, weight: 0.05, label: 'SSL Certificate' },
      domainAge: { score: qrDomainAgeScore, weight: 0.10, label: 'Domain Age' },
      blacklists: { score: analysis.blacklists.some(b => b.listed) ? 5 : 80, weight: 0.30, label: 'Blacklist Status' },
      aiAnalysis: { score: aiResult.confidence, weight: 0.15, label: 'AI Analysis' },
      communityReports: { score: community.score, weight: 0.40, label: 'Community Reports' },
    };

    const finalScore = calculateFinalScore({
      ssl: qrScoreFactors.ssl.score,
      domainAge: qrScoreFactors.domainAge.score,
      blacklists: qrScoreFactors.blacklists.score,
      aiAnalysis: qrScoreFactors.aiAnalysis.score,
      communityReports: qrScoreFactors.communityReports.score,
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
      scoreBreakdown: Object.values(qrScoreFactors).map(f => ({ label: f.label, score: f.score, weight: f.weight, contribution: Math.round(f.score * f.weight) })),
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
