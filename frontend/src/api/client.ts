/// <reference types="vite/client" />
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('trustlens-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('trustlens-refresh');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post(
            (import.meta.env.VITE_API_URL || '/api/v1') + '/auth/refresh',
            { refreshToken }
          );
          localStorage.setItem('trustlens-token', data.data.token);
          localStorage.setItem('trustlens-refresh', data.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.data.token}`;
          return apiClient(error.config);
        } catch {
          localStorage.removeItem('trustlens-token');
          localStorage.removeItem('trustlens-refresh');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export async function scanUrl(input: string) {
  const { data } = await apiClient.post('/scan/url', { input });
  return data.data.report;
}

export async function scanEmail(input: string) {
  const { data } = await apiClient.post('/scan/email', { input });
  return data.data.report;
}

export async function scanSms(input: string) {
  const { data } = await apiClient.post('/scan/sms', { input });
  return data.data.report;
}

export async function scanPhone(input: string) {
  const { data } = await apiClient.post('/scan/phone', { input });
  return data.data.report;
}

export async function getReport(shareId: string) {
  const { data } = await apiClient.get(`/scan/report/${shareId}`);
  return data.data.report;
}

export async function getRecentSearches() {
  const { data } = await apiClient.get('/scan/recent');
  return data.data.searches;
}

export async function getTrendingScams() {
  const { data } = await apiClient.get('/scan/trending');
  return data.data.trends;
}

export async function getCommunityReports(params?: { page?: number; type?: string; category?: string }) {
  const { data } = await apiClient.get('/community', { params });
  return data.data;
}

export async function submitContact(formData: { name: string; email: string; subject: string; message: string }) {
  const { data } = await apiClient.post('/contact', formData);
  return data;
}

export async function getBlogPosts(params?: { page?: number; category?: string }) {
  const { data } = await apiClient.get('/blog', { params });
  return data.data;
}

export async function getBlogPost(slug: string) {
  const { data } = await apiClient.get(`/blog/${slug}`);
  return data.data.post;
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data.data;
}

export async function register(name: string, email: string, password: string) {
  const { data } = await apiClient.post('/auth/register', { name, email, password });
  return data.data;
}

export async function getAdminDashboard() {
  const { data } = await apiClient.get('/admin/dashboard');
  return data.data;
}

export async function getAdminUsers(page = 1, limit = 20) {
  const { data } = await apiClient.get('/admin/users', { params: { page, limit } });
  return data.data;
}

export async function getAdminReports() {
  const { data } = await apiClient.get('/admin/reports/pending');
  return data.data;
}

export async function updateReportStatus(id: string, status: string) {
  const { data } = await apiClient.patch(`/admin/reports/${id}/status`, { status });
  return data;
}

export async function getAdminBlogPosts() {
  const { data } = await apiClient.get('/admin/blog');
  return data.data;
}

export async function createAdminBlogPost(postData: any) {
  const { data } = await apiClient.post('/admin/blog', postData);
  return data.data;
}

export async function updateAdminBlogPost(id: string, postData: any) {
  const { data } = await apiClient.put(`/admin/blog/${id}`, postData);
  return data.data;
}

export async function getAdminAnalytics() {
  const { data } = await apiClient.get('/admin/analytics');
  return data.data;
}

export async function getProfile() {
  const { data } = await apiClient.get('/auth/profile');
  return data.data;
}
