import { TrendingUp, Globe, MessageSquare, Mail, Phone } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';

const trends = [
  { type: 'URL', count: 1250, label: 'Phishing URLs', change: '+12%', icon: Globe },
  { type: 'Email', count: 890, label: 'Phishing Emails', change: '+8%', icon: Mail },
  { type: 'SMS', count: 670, label: 'SMS Scams', change: '+23%', icon: MessageSquare },
  { type: 'Phone', count: 430, label: 'Scam Calls', change: '+5%', icon: Phone },
];

export default function TrendingScams() {
  return (
    <>
      <SEOHead title="Trending Scams - Current Cybersecurity Threats" description="See the latest trending scams and cybersecurity threats being reported. Real-time scam trend data from TrustLens analysis." canonical="https://trustlens.app/trending-scams" />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Trending Scams' }]} />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center"><TrendingUp className="w-5 h-5 text-[#2563EB]" /></div>
            <h1 className="font-heading font-700 text-2xl md:text-3xl text-[#0F172A]">Trending Scams</h1>
          </div>
          <p className="text-[#475569] mb-8">Current trending scams and threats based on community reports and analysis data.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {trends.map((t) => (
              <Card key={t.type}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
                    <t.icon className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#0F172A]">{t.label}</span>
                      <span className="text-sm text-[#DC2626]">{t.change}</span>
                    </div>
                    <span className="text-sm text-[#475569]">{t.count.toLocaleString()} reports</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
