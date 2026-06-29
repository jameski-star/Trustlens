import { Request, Response, NextFunction } from 'express';
import { Report } from '../models/Report';
import { generatePDF } from '../services/pdfGenerator';
import { logger } from '../utils/logger';

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
    logger.error({ err: error }, 'PDF generation error');
    next(error);
  }
}
