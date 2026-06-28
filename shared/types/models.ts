export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReport {
  _id: string;
  type: 'url' | 'email' | 'sms' | 'phone' | 'screenshot' | 'qrcode';
  input: string;
  riskScore: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  status: 'completed' | 'pending' | 'failed';
  summary: string;
  details: {
    ssl: SSLCheck | null;
    domainAge: DomainAge | null;
    whois: WhoisInfo | null;
    blacklists: BlacklistCheck[];
    aiAnalysis: AIAnalysis | null;
    communityReports: number;
    detectedRisks: Risk[];
  };
  recommendations: string[];
  confidenceScore: number;
  userId?: string;
  shareId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SSLCheck {
  valid: boolean;
  issuer: string;
  expiresAt: Date;
  daysRemaining: number;
}

export interface DomainAge {
  created: Date;
  daysSinceCreation: number;
  monthsSinceCreation: number;
}

export interface WhoisInfo {
  registrar: string;
  creationDate: Date;
  expirationDate: Date;
  lastUpdated: Date;
  country: string;
  organization: string;
}

export interface BlacklistCheck {
  name: string;
  listed: boolean;
  source: string;
}

export interface AIAnalysis {
  summary: string;
  riskFactors: string[];
  confidence: number;
  modelVersion: string;
}

export interface Risk {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface ICommunityReport {
  _id: string;
  type: 'url' | 'email' | 'phone' | 'whatsapp' | 'crypto' | 'investment';
  target: string;
  title: string;
  description: string;
  category: string;
  reports: number;
  isVerified: boolean;
  status: 'published' | 'pending' | 'rejected';
  screenshots: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  isPublished: boolean;
  publishedAt: Date | null;
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ISearchHistory {
  _id: string;
  query: string;
  type: string;
  resultId: string;
  userId?: string;
  createdAt: Date;
}
