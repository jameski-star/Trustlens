import { useState, useEffect } from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCommunityReports, getBlogPosts } from '../api/client';
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

interface AlertItem {
  id: string;
  title: string;
  severity: string;
  date: string;
  description: string;
  source: 'community' | 'blog';
  href?: string;
}

export default function ScamAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getCommunityReports({ page: 1, limit: 50, minReports: 5 }),
      getBlogPosts({ page: 1, category: 'Scam Alert' }),
    ])
      .then(([communityData, blogData]) => {
        if (cancelled) return;
        const community: AlertItem[] = (communityData?.items || []).map(
          (r: { _id: string; title: string; description: string; type: string; createdAt: string }) => ({
            id: `community-${r._id}`,
            title: r.title,
            severity: severityMap[r.type] || 'Medium',
            date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            description: r.description,
            source: 'community' as const,
          })
        );
        const blog: AlertItem[] = (blogData?.items || []).map(
          (p: { _id: string; title: string; excerpt: string; slug: string; publishedAt: string }) => ({
            id: `blog-${p._id}`,
            title: p.title,
            severity: 'Medium',
            date: new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            description: p.excerpt,
            source: 'blog' as const,
            href: `/blog/${p.slug}`,
          })
        );
        const merged = [...community, ...blog].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAlerts(merged);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
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
              {alerts.map((alert) => {
                const inner = (
                  <div className="flex items-start gap-4">
                    {alert.source === 'blog' ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-lg flex-shrink-0 mt-0.5 bg-[#EFF6FF] text-[#2563EB] flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Article
                      </span>
                    ) : (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-lg flex-shrink-0 mt-0.5 ${
                        alert.severity === 'Critical' ? 'bg-[#FEF2F2] text-[#DC2626]' :
                        alert.severity === 'High' ? 'bg-[#FFFBEB] text-[#D97706]' : 'bg-[#F0FDF4] text-[#16A34A]'
                      }`}>{alert.severity}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0F172A] truncate">{alert.title}</h3>
                      <p className="text-sm text-[#475569] mt-1 line-clamp-2">{alert.description}</p>
                      <span className="text-xs text-[#475569] mt-2 block">{alert.date}</span>
                    </div>
                  </div>
                );
                return alert.href ? (
                  <Link key={alert.id} to={alert.href}>
                    <Card hover>{inner}</Card>
                  </Link>
                ) : (
                  <Card key={alert.id} hover>{inner}</Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}