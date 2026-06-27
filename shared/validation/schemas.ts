export interface ScanInput {
  input: string;
  type: 'url' | 'email' | 'sms' | 'phone' | 'screenshot' | 'qrcode';
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface CommunityReportInput {
  type: 'url' | 'email' | 'phone' | 'whatsapp' | 'crypto' | 'investment';
  target: string;
  title: string;
  description: string;
  category: string;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  isPublished?: boolean;
}
