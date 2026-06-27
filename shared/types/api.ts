import { IReport, ICommunityReport, IBlogPost } from './models';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ScanResponse {
  report: IReport;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface ScanRequest {
  input: string;
  type: 'url' | 'email' | 'sms' | 'phone' | 'screenshot' | 'qrcode';
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface CommunityReportFormData {
  type: string;
  target: string;
  title: string;
  description: string;
  category: string;
}
