import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface CommunityReportItem {
  _id: string;
  type: string;
  target: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function AdminReports() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/reports/pending');
      return data.data as { items: CommunityReportItem[]; total: number };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/admin/reports/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['community-reports'] });
      toast.success('Report status updated');
    },
    onError: () => toast.error('Failed to update report'),
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading font-700 text-2xl text-[#0F172A]">Community Reports</h1>
        <p className="text-sm text-[#475569] mt-1">Moderate pending community reports</p>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
          </div>
        )}

        {data?.items.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center">
            <p className="text-[#475569]">No pending reports to moderate</p>
          </div>
        )}

        {data?.items.map(report => (
          <div key={report._id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium uppercase text-[#475569]">{report.type}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    report.status === 'pending' ? 'bg-[#FFFBEB] text-[#D97706]' :
                    report.status === 'published' ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <h3 className="font-semibold text-[#0F172A]">{report.title}</h3>
                <p className="text-sm text-[#475569] mt-1">{report.target}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => updateMutation.mutate({ id: report._id, status: 'published' })}
                  disabled={updateMutation.isPending}
                  className="p-2 rounded-lg text-[#16A34A] hover:bg-[#F0FDF4] transition-colors"
                  title="Approve"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => updateMutation.mutate({ id: report._id, status: 'rejected' })}
                  disabled={updateMutation.isPending}
                  className="p-2 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                  title="Reject"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-[#475569]">{report.description}</p>
            <p className="text-xs text-[#475569] mt-2">
              Submitted {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
