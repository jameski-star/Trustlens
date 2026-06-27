import { AlertTriangle, Shield, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';

const alerts = [
  { title: 'Fake PayPal Security Login Pages Surge', severity: 'Critical', date: 'Dec 20, 2024', desc: 'Multiple phishing sites impersonating PayPal security pages have been detected this month.' },
  { title: 'Crypto Investment Scam Targeting WhatsApp Users', severity: 'High', date: 'Dec 18, 2024', desc: 'Scammers are using WhatsApp groups to promote fake crypto investment platforms.' },
  { title: 'New SMS Phishing Campaign: "Package Delivery Failed"', severity: 'High', date: 'Dec 15, 2024', desc: 'Fake delivery notification texts contain links to malware-hosting websites.' },
  { title: 'Job Offer Scams on Telegram and Signal', severity: 'Medium', date: 'Dec 12, 2024', desc: 'Fake remote job offers on messaging apps are stealing personal information.' },
  { title: 'QR Code Phishing in Parking Meters', severity: 'Medium', date: 'Dec 10, 2024', desc: 'Fake QR codes on parking meters redirect to payment phishing sites.' },
];

export default function ScamAlerts() {
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

          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.title} hover>
                <div className="flex items-start gap-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-lg flex-shrink-0 mt-0.5 ${
                    alert.severity === 'Critical' ? 'bg-[#FEF2F2] text-[#DC2626]' :
                    alert.severity === 'High' ? 'bg-[#FFFBEB] text-[#D97706]' : 'bg-[#F0FDF4] text-[#16A34A]'
                  }`}>{alert.severity}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0F172A]">{alert.title}</h3>
                    <p className="text-sm text-[#475569] mt-1">{alert.desc}</p>
                    <span className="text-xs text-[#475569] mt-2 block">{alert.date}</span>
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
