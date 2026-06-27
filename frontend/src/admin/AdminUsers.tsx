import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import apiClient from '../api/client';
import AdminLayout from './AdminLayout';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface UsersResponse {
  items: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminUsers() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/users', { params: { page, limit: 20 } });
      return data.data as UsersResponse;
    },
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading font-700 text-2xl text-[#0F172A]">Users</h1>
        <p className="text-sm text-[#475569] mt-1">Manage registered users</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="text-left px-4 py-3 font-medium text-[#475569]">Name</th>
                <th className="text-left px-4 py-3 font-medium text-[#475569]">Email</th>
                <th className="text-left px-4 py-3 font-medium text-[#475569]">Role</th>
                <th className="text-left px-4 py-3 font-medium text-[#475569]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-12">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              )}
              {data?.items.map(user => (
                <tr key={user._id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#0F172A]">{user.name}</td>
                  <td className="px-4 py-3 text-[#475569]">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg ${
                      user.role === 'admin' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F1F5F9] text-[#475569]'
                    }`}>
                      {user.role === 'admin' && <Shield className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#475569]">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-[#475569]">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0]">
            <span className="text-sm text-[#475569]">
              Page {data.page} of {data.totalPages} ({data.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= (data?.totalPages || 1)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
