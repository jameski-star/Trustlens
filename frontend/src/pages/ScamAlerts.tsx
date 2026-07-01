import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { SITE_URL } from '../config';

interface ScamAlertItem {
  _id: string;
  title: string;
  target: string;
  description: string;
  type: string;
  reports: number;
  isVerified: boolean;
  category: string;
  createdAt: string;
}
import { getScamAlerts } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import { ReportSkeleton } from '../components/Skeleton';

const severityMap: Record<string, string> = {
  investment: 'Critical',
  crypto: 'High',
  whatsapp: 'High',
  url: 'Medium',
  email: 'Medium',
  phone: 'Low',
};

export default function ScamAlerts() {
  const { data, isLoading } = useQuery({
    queryKey: ['scam-alerts'],
    queryFn: () => getScamAlerts({ page: 1, limit: 50 }),
    staleTime: 120_000,
  });

  const alerts = data?.items || [];

  return (
    <>
      <SEOHead title="Scam Alerts - Latest Cybersecurity Threats" description="Stay informed about the latest scams, phishing campaigns, and cybersecurity threats. Real-time scam alerts from TrustLens." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Scam Alerts' }]} />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[var(--trust-danger-bg)] rounded-xl flex items-center justify-center"><Bell className="w-5 h-5 text-[var(--trust-danger)]" /></div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)] text-wrap: balance">Scam Alerts</h1>
          </div>
          <p className="text-[var(--text-secondary)] mb-8">Community-verified scam alerts. Only reports with 5+ upvotes are shown here.</p>

          {isLoading && <ReportSkeleton />}

          {!isLoading && alerts.length === 0 && (
            <p className="text-center text-[var(--text-secondary)] py-12">No scam alerts yet. Reports need at least 5 upvotes to appear here.</p>
          )}

          {!isLoading && alerts.length > 0 && (
            <div className="space-y-4">
              {alerts.map((alert: ScamAlertItem) => (
                <Card key={alert._id}>
                  <div className="flex items-start gap-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg flex-shrink-0 min-h-[44px] flex items-center ${
                      severityMap[alert.type] === 'Critical' ? 'bg-[var(--trust-danger-bg)] text-[var(--trust-danger)]' :
                      severityMap[alert.type] === 'High' ? 'bg-[var(--trust-warning-bg)] text-[var(--trust-warning)]' : 'bg-[var(--trust-safe-bg)] text-[var(--trust-safe)]'
                    }`}>
                      {severityMap[alert.type] || 'Medium'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-600 text-[var(--text-primary)]">{alert.title}</h3>
                        {alert.category && (
                          <span className="text-xs bg-[var(--bg-subtle)] px-2 py-0.5 rounded text-[var(--text-secondary)]">{alert.category}</span>
                        )}
                      </div>
                      {alert.target && (
                        <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5 truncate tabular-nums">{alert.target}</p>
                      )}
                      <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
                        <span className="tabular-nums">{alert.reports} reports</span>
                        <span>{new Date(alert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DataFeed',
            name: 'Active Scam Alerts - TrustLens',
            description: 'Real-time scam alerts and verified community reports about phishing, fraud, and cybersecurity threats.',
            url: `${SITE_URL}/scam-alerts`,
          }),
        }} />
      </div>
    </>
  );
}