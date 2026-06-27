import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const [alerts, setAlerts] = useState<Array<{ title: string; severity: string; createdAt: string; description: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommunityReports({ page: 1 })
      .then(data => {
        const reports = data?.reports || [];
        setAlerts(reports.map((r: { title: string; description: string; type: string; createdAt: string }) => ({
          title: r.title,
          severity: severityMap[r.type] || 'Medium',
          createdAt: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          description: r.description,
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEOHead title="Scam Alerts - Latest Cybersecurity Threats" description="Stay informed about the latest scams, phishing campaigns, and cybersecurity threats. Real-time scam alerts from TrustLens." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Scam Alerts' }]} />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FEF2F2] rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-[#DC2626]" /></div>
            <h1 className="font-heading font-700 text-2xl md:text-3xl text-[#0F172A]">Scam Alerts</h1>
          </div>
          <p className="text-[#475569] mb-8">Stay informed about the latest scams and cybersecurity threats targeting users worldwide.</p>

          {loading && <ReportSkeleton />}

          {!loading && alerts.length === 0 && (
            <p className="text-center text-[#475569] py-12">No scam alerts yet.</p>
          )}

          {!loading && alerts.length > 0 && (
            <div className="space-y-4">
              {alerts.map((alert, idx) => (
                <Card key={idx} hover>
                  <div className="flex items-start gap-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg flex-shrink-0 mt-0.5 ${
                      alert.severity === 'Critical' ? 'bg-[#FEF2F2] text-[#DC2626]' :
                      alert.severity === 'High' ? 'bg-[#FFFBEB] text-[#D97706]' : 'bg-[#F0FDF4] text-[#16A34A]'
                    }`}>{alert.severity}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#0F172A]">{alert.title}</h3>
                      <p className="text-sm text-[#475569] mt-1">{alert.description}</p>
                      <span className="text-xs text-[#475569] mt-2 block">{alert.createdAt}</span>
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
