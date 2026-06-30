import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import apiClient from '../api/client';

export default function Status() {
  const { data, isLoading } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const { data: res } = await apiClient.get('/health');
      return res.data as {
        status: string; services: { name: string; status: string }[]; timestamp: string;
      };
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const services = data?.services ?? [];
  const allOperational = services.every(s => s.status === 'operational');

  return (
    <>
      <SEOHead title="System Status" description="TrustLens system status page. Check the current operational status of all TrustLens services." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Status' }]} />
        <div className="max-w-2xl mx-auto">
          <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)] mb-2">System Status</h1>
          <p className="text-[var(--text-secondary)] mb-8">Current operational status of all TrustLens services.</p>

          <Card className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              {isLoading ? (
                <AlertTriangle className="w-5 h-5 text-[#D97706]" />
              ) : allOperational ? (
                <CheckCircle className="w-5 h-5 text-[#16A34A]" />
              ) : (
                <XCircle className="w-5 h-5 text-[#DC2626]" />
              )}
              <span className={`font-semibold ${isLoading ? 'text-[#D97706]' : allOperational ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                {isLoading ? 'Checking...' : allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {data ? `Last checked: ${new Date(data.timestamp).toLocaleString()}` : 'Fetching status...'}
            </p>
          </Card>

          <div className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-[var(--text-secondary)]">Loading services...</p>
            ) : (
              services.map((s) => (
                <Card key={s.name}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[var(--text-primary)]">{s.name}</span>
                    <div className="flex items-center gap-2">
                      {s.status === 'operational' ? (
                        <><CheckCircle className="w-4 h-4 text-[#16A34A]" /><span className="text-sm text-[#16A34A]">Operational</span></>
                      ) : s.status === 'degraded' ? (
                        <><AlertTriangle className="w-4 h-4 text-[#D97706]" /><span className="text-sm text-[#D97706]">Degraded</span></>
                      ) : (
                        <><XCircle className="w-4 h-4 text-[#DC2626]" /><span className="text-sm text-[#DC2626]">Issues</span></>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
