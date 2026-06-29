import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Search, Type } from 'lucide-react';
import apiClient from '../api/client';
import AdminLayout from './AdminLayout';

interface AnalyticsData {
  dailyScans: { _id: string; count: number }[];
  reportByType: { _id: string; count: number }[];
  popularSearches: { _id: string; count: number }[];
}

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/analytics');
      return data.data as AnalyticsData;
    },
    refetchInterval: 30 * 1000,
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading font-700 text-2xl text-[var(--text-primary)]">Analytics</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Platform usage and trends</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6">
              <div className="skeleton h-6 w-32 mb-4" />
              <div className="skeleton h-48" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-[var(--text-accent)]" />
              <h2 className="font-semibold text-[var(--text-primary)]">Daily Scans (30 days)</h2>
            </div>
            {data?.dailyScans && data.dailyScans.length > 0 ? (
              <div className="space-y-2">
                {data.dailyScans.slice(-14).map(day => (
                  <div key={day._id} className="flex items-center gap-3">
                    <span className="text-xs text-[var(--text-secondary)] w-24">{day._id}</span>
                    <div className="flex-1 bg-[var(--bg-subtle)] rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-[#2563EB] h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (day.count / Math.max(...data.dailyScans.map(d => d.count))) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-[var(--text-secondary)] w-8 text-right">{day.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No scan data available yet</p>
            )}
          </div>

          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-[#16A34A]" />
              <h2 className="font-semibold text-[var(--text-primary)]">Scans by Type</h2>
            </div>
            {data?.reportByType && data.reportByType.length > 0 ? (
              <div className="space-y-3">
                {data.reportByType.map(type => (
                  <div key={type._id} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-primary)] capitalize">{type._id}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-[var(--bg-subtle)] rounded-full h-5 overflow-hidden">
                        <div
                          className="bg-[#16A34A] h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (type.count / Math.max(...data.reportByType.map(t => t.count))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-[var(--text-secondary)] w-8 text-right">{type.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No scan data available yet</p>
            )}
          </div>

          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-[#D97706]" />
              <h2 className="font-semibold text-[var(--text-primary)]">Popular Searches</h2>
            </div>
            {data?.popularSearches && data.popularSearches.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.popularSearches.map((search, i) => (
                  <div key={search._id} className="flex items-center gap-3 px-3 py-2 bg-[var(--bg-muted)] rounded-xl">
                    <span className="text-xs font-mono text-[var(--text-secondary)] w-5">#{i + 1}</span>
                    <span className="text-sm text-[var(--text-primary)] truncate flex-1">{search._id}</span>
                    <span className="text-xs font-mono text-[var(--text-secondary)]">{search.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No search data available yet</p>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
