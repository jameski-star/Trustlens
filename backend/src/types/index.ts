export interface ScanResult {
  ssl: { valid: boolean; issuer: string; expiresAt: Date; daysRemaining: number } | null;
  domainAge: { created: Date; daysSinceCreation: number; monthsSinceCreation: number } | null;
  whois: { registrar: string; creationDate: Date | null; expirationDate: Date | null; lastUpdated: Date | null; country: string; organization: string } | null;
  blacklists: Array<{ name: string; listed: boolean; source: string }>;
  riskScore: number;
  detectedRisks: Array<{ category: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string }>;
  summary: string;
}

export interface AIAnalysisResult {
  summary: string;
  riskFactors: string[];
  confidence: number;
  modelVersion: string;
}
