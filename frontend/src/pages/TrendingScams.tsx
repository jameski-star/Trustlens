import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Globe, MessageSquare, Mail, Phone, Camera, QrCode } from 'lucide-react';
import { getTrendingScams } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import { ReportSkeleton } from '../components/Skeleton';

const iconMap: Record<string, { icon: typeof Globe; label: string }> = {
  url: { icon: Globe, label: 'Phishing URLs' },
  email: { icon: Mail, label: 'Phishing Emails' },
  sms: { icon: MessageSquare, label: 'SMS Scams' },
  phone: { icon: Phone, label: 'Scam Calls' },
  screenshot: { icon: Camera, label: 'Screenshot Scans' },
  qrcode: { icon: QrCode, label: 'QR Code Scans' },
};

export default function TrendingScams() {
  const { data: trends, isLoading } = useQuery({
    queryKey: ['trending-scams'],
    queryFn: getTrendingScams,
  });

  return (
    <>
      <SEOHead title="Trending Scams - Current Cybersecurity Threats" description="See the latest trending scams and cybersecurity threats being reported. Real-time scam trend data from TrustLens analysis." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Trending Scams' }]} />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--bg-accent)] rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-[var(--text-accent)]" /></div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">Trending Scams</h1>
          </div>
          <p className="text-[var(--text-secondary)] mb-8">Current trending scams and threats based on community reports and analysis data.</p>

          {isLoading && <ReportSkeleton />}

          {!isLoading && (!trends || trends.length === 0) && (
            <p className="text-center text-[var(--text-secondary)] py-12">No trending data yet.</p>
          )}

          {!isLoading && trends && trends.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {(trends as Array<{ _id: string; count: number }>).map((t) => {
                const mapped = iconMap[t._id] || { icon: Globe, label: t._id };
                const Icon = mapped.icon;
                return (
                  <Card key={t._id}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[var(--bg-accent)] rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[var(--text-accent)]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[var(--text-primary)]">{mapped.label}</span>
                        </div>
                        <span className="text-sm text-[var(--text-secondary)]">{t.count.toLocaleString()} reports</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
