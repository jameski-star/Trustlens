import { useQuery } from '@tanstack/react-query';
import { Shield, Users, Search, Flag, FileText, Activity } from 'lucide-react';
import apiClient from '../api/client';
import AdminLayout from './AdminLayout';

interface DashboardStats {
  stats: {
    totalUsers: number;
    totalScans: number;
    totalReports: number;
    totalPosts: number;
    scansToday: number;
  };
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/dashboard');
      return data.data as DashboardStats;
    },
  });

  const stats = data?.stats;

  const items = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'bg-[#EFF6FF] text-[#2563EB]' },
    { label: 'Total Scans', value: stats?.totalScans ?? '—', icon: Search, color: 'bg-[#F0FDF4] text-[#16A34A]' },
    { label: 'Scans Today', value: stats?.scansToday ?? '—', icon: Activity, color: 'bg-[#FFFBEB] text-[#D97706]' },
    { label: 'Community Reports', value: stats?.totalReports ?? '—', icon: Flag, color: 'bg-[#FEF2F2] text-[#DC2626]' },
    { label: 'Blog Posts', value: stats?.totalPosts ?? '—', icon: FileText, color: 'bg-[#F5F3FF] text-[#7C3AED]' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading font-700 text-2xl text-[#0F172A]">Dashboard</h1>
        <p className="text-sm text-[#475569] mt-1">Overview of TrustLens platform activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {items.map(item => (
          <div key={item.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mb-3`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-heading font-800 text-[#0F172A]">
              {isLoading ? <span className="skeleton inline-block w-12 h-6" /> : item.value}
            </p>
            <p className="text-sm text-[#475569] mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h2 className="font-semibold text-[#0F172A] mb-2">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          <a href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors text-sm text-[#475569]">
            <Users className="w-4 h-4 text-[#2563EB]" />
            Manage Users
          </a>
          <a href="/admin/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors text-sm text-[#475569]">
            <Flag className="w-4 h-4 text-[#2563EB]" />
            Moderate Reports
          </a>
          <a href="/admin/blog" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors text-sm text-[#475569]">
            <FileText className="w-4 h-4 text-[#2563EB]" />
            Manage Blog
          </a>
          <a href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors text-sm text-[#475569]">
            <BarChart3 className="w-4 h-4 text-[#2563EB]" />
            View Analytics
          </a>
          <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors text-sm text-[#475569]">
            <Shield className="w-4 h-4 text-[#2563EB]" />
            View Site
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}

function BarChart3( props: any ) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
