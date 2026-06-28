import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import AdminLayout from './AdminLayout';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, Eye, X, ImageIcon, ShieldCheck } from 'lucide-react';

interface CommunityReportItem {
  _id: string;
  type: string;
  target: string;
  title: string;
  description: string;
  category: string;
  status: string;
  screenshots: string[];
  reports: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') || '';

export default function AdminReports() {
  const [selectedReport, setSelectedReport] = useState<CommunityReportItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
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
      setSelectedReport(null);
      toast.success('Report status updated');
    },
    onError: () => toast.error('Failed to update report'),
  });

  const openDetail = async (report: CommunityReportItem) => {
    setDetailLoading(true);
    try {
      const { data } = await apiClient.get(`/admin/reports/${report._id}`);
      setSelectedReport(data.data.report);
    } catch {
      toast.error('Failed to load report details');
    } finally {
      setDetailLoading(false);
    }
  };

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
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-medium uppercase text-[#475569]">{report.type}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    report.status === 'pending' ? 'bg-[#FFFBEB] text-[#D97706]' :
                    report.status === 'published' ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FEF2F2] text-[#DC2626]'
                  }`}>
                    {report.status}
                  </span>
                  {report.category && (
                    <span className="text-xs bg-[#F1F5F9] px-2 py-0.5 rounded-full text-[#475569]">{report.category}</span>
                  )}
                  {report.screenshots?.length > 0 && (
                    <span className="text-xs text-[#475569] flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {report.screenshots.length} screenshot{report.screenshots.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-[#0F172A]">{report.title}</h3>
                <p className="text-sm text-[#475569] mt-1 font-mono">{report.target}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openDetail(report)}
                  className="p-2 rounded-lg text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
                  title="View details"
                >
                  <Eye className="w-5 h-5" />
                </button>
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
            <p className="text-sm text-[#475569]">{report.description.substring(0, 300)}{report.description.length > 300 ? '...' : ''}</p>
            <p className="text-xs text-[#475569] mt-2">
              Submitted {new Date(report.createdAt).toLocaleDateString()} | Reports: {report.reports} | {report.isVerified ? 'Verified' : 'Not verified'}
            </p>
          </div>
        ))}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-12 px-4 pb-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelectedReport(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-700 text-lg text-[#0F172A]">Report Details</h2>
              <button onClick={() => setSelectedReport(null)} className="p-1 rounded-lg hover:bg-[#F1F5F9]">
                <X className="w-5 h-5 text-[#475569]" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Type</span>
                    <p className="text-sm font-medium text-[#0F172A] mt-0.5">{selectedReport.type}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Category</span>
                    <p className="text-sm font-medium text-[#0F172A] mt-0.5">{selectedReport.category}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Status</span>
                    <p className="text-sm font-medium text-[#0F172A] mt-0.5 capitalize">{selectedReport.status}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Reports Count</span>
                    <p className="text-sm font-medium text-[#0F172A] mt-0.5">{selectedReport.reports}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Verified</span>
                    <p className="text-sm font-medium text-[#0F172A] mt-0.5">{selectedReport.isVerified ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Submitted</span>
                    <p className="text-sm font-medium text-[#0F172A] mt-0.5">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Title</span>
                  <p className="text-sm font-medium text-[#0F172A] mt-0.5">{selectedReport.title}</p>
                </div>

                <div>
                  <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Target</span>
                  <p className="text-sm font-mono text-[#0F172A] mt-0.5 break-all">{selectedReport.target}</p>
                </div>

                <div>
                  <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Description</span>
                  <p className="text-sm text-[#475569] mt-0.5 whitespace-pre-wrap">{selectedReport.description}</p>
                </div>

                {selectedReport.screenshots?.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      Screenshots ({selectedReport.screenshots.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                      {selectedReport.screenshots.map((src, i) => (
                        <a key={i} href={src.startsWith('http') ? src : `${API_BASE}${src}`} target="_blank" rel="noopener noreferrer">
                          <img
                            src={src.startsWith('http') ? src : `${API_BASE}${src}`}
                            alt={`Screenshot ${i + 1}`}
                            className="w-full h-40 object-cover rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] transition-colors"
                          />
                        </a>
                      ))}
                    </div>
                    <div className="flex items-start gap-2 mt-3 p-3 bg-[#F0FDF4] rounded-xl">
                      <ShieldCheck className="w-4 h-4 text-[#16A34A] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#166534]">
                        Screenshots are only visible to admins for verification purposes. They are never posted publicly.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => updateMutation.mutate({ id: selectedReport._id, status: 'published' })}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-[#16A34A] text-white text-sm font-medium rounded-xl hover:bg-[#15803D] transition-colors disabled:opacity-50"
                  >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve
                  </button>
                  <button
                    onClick={() => updateMutation.mutate({ id: selectedReport._id, status: 'rejected' })}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-[#DC2626] text-white text-sm font-medium rounded-xl hover:bg-[#B91C1C] transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}