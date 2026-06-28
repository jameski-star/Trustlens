import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { getCommunityReports } from '../api/client';
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
    queryFn: () => getCommunityReports({ page: 1, limit: 50, minReports: 5 }),
  });

  const alerts = data?.items || [];

  return (
    <>
      <SEOHead title="Scam Alerts - Latest Cybersecurity Threats" description="Stay informed about the latest scams, phishing campaigns, and cybersecurity threats. Real-time scam alerts from TrustLens." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Scam Alerts' }]} />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FEF2F2] rounded-xl flex items-center justify-center"><Bell className="w-5 h-5 text-[#DC2626]" /></div>
            <h1 className="font-heading font-700 text-2xl md:text-3xl text-[#0F172A]">Scam Alerts</h1>
          </div>
          <p className="text-[#475569] mb-8">Community-verified scam alerts. Only reports with 5+ upvotes are shown here.</p>

          {isLoading && <ReportSkeleton />}

          {!isLoading && alerts.length === 0 && (
            <p className="text-center text-[#475569] py-12">No scam alerts yet. Reports need at least 5 upvotes to appear here.</p>
          )}

          {!isLoading && alerts.length > 0 && (
            <div className="space-y-4">
              {alerts.map((alert: any) => (
                <Card key={alert._id}>
                  <div className="flex items-start gap-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg flex-shrink-0 mt-0.5 ${
                      severityMap[alert.type] === 'Critical' ? 'bg-[#FEF2F2] text-[#DC2626]' :
                      severityMap[alert.type] === 'High' ? 'bg-[#FFFBEB] text-[#D97706]' : 'bg-[#F0FDF4] text-[#16A34A]'
                    }`}>
                      {severityMap[alert.type] || 'Medium'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#0F172A]">{alert.title}</h3>
                        {alert.category && (
                          <span className="text-xs bg-[#F1F5F9] px-2 py-0.5 rounded text-[#475569]">{alert.category}</span>
                        )}
                      </div>
                      {alert.target && (
                        <p className="text-xs font-mono text-[#475569] mt-0.5 truncate">{alert.target}</p>
                      )}
                      <p className="text-sm text-[#475569] mt-1 line-clamp-2">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#475569]">
                        <span>{alert.reports} reports</span>
                        <span>{new Date(alert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}