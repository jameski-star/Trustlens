import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import apiClient from '../api/client';
import { SITE_URL } from '../config';

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
        <Breadcrumbs items={[{ label: 'System Status' }]} />
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">System Status</h1>
            <span className="official-stamp">
              {isLoading ? 'Checking...' : allOperational ? '✓ All Systems Operational' : '⚠ Some Systems Degraded'}
            </span>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">Current operational status of all TrustLens services. Updated every 60 seconds.</p>

          <Card className="mb-6">
            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="w-12 h-12 rounded-xl bg-[var(--trust-warning-bg)] flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-[var(--trust-warning)]" />
                </div>
              ) : allOperational ? (
                <div className="w-12 h-12 rounded-xl bg-[var(--trust-safe-bg)] flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[var(--trust-safe)]" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[var(--trust-danger-bg)] flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-[var(--trust-danger)]" />
                </div>
              )}
              <div>
                <span className={`font-heading font-700 text-lg ${isLoading ? 'text-[var(--trust-warning)]' : allOperational ? 'text-[var(--trust-safe)]' : 'text-[var(--trust-danger)]'}`}>
                  {isLoading ? 'Checking Status...' : allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
                </span>
                <p className="text-sm text-[var(--text-secondary)]">
                  {data ? `Last checked: ${new Date(data.timestamp).toLocaleString()}` : 'Fetching status...'}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {isLoading ? (
              <p className="text-sm text-[var(--text-secondary)]">Loading services...</p>
            ) : (
              services.map((s) => (
                <Card key={s.name}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        s.status === 'operational' ? 'bg-[var(--trust-safe)]' :
                        s.status === 'degraded' ? 'bg-[var(--trust-warning)]' : 'bg-[var(--trust-danger)]'
                      }`} />
                      <span className="font-medium text-[var(--text-primary)]">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.status === 'operational' ? (
                        <span className="text-sm text-[var(--trust-safe)] font-medium">Operational</span>
                      ) : s.status === 'degraded' ? (
                        <span className="text-sm text-[var(--trust-warning)] font-medium">Degraded</span>
                      ) : (
                        <span className="text-sm text-[var(--trust-danger)] font-medium">Issues</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'TrustLens System Status',
            description: 'Real-time status of TrustLens security analysis services and API.',
            url: `${SITE_URL}/status`,
          }),
        }} />
      </div>
    </>
  );
}
