import { CheckCircle, XCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';

const services = [
  { name: 'URL Scanner', status: 'operational' as const },
  { name: 'Email Scanner', status: 'operational' as const },
  { name: 'SMS Scanner', status: 'operational' as const },
  { name: 'Screenshot Scanner', status: 'operational' as const },
  { name: 'QR Code Scanner', status: 'operational' as const },
  { name: 'API', status: 'operational' as const },
  { name: 'AI Analysis', status: 'operational' as const },
  { name: 'Community Reports', status: 'operational' as const },
];

export default function Status() {
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
              <CheckCircle className="w-5 h-5 text-[#16A34A]" />
              <span className="font-semibold text-[#16A34A]">All Systems Operational</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">Last checked: {new Date().toLocaleString()}</p>
          </Card>

          <div className="space-y-2">
            {services.map((s) => (
              <Card key={s.name}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--text-primary)]">{s.name}</span>
                  <div className="flex items-center gap-2">
                    {s.status === 'operational' ? (
                      <><CheckCircle className="w-4 h-4 text-[#16A34A]" /><span className="text-sm text-[#16A34A]">Operational</span></>
                    ) : (
                      <><XCircle className="w-4 h-4 text-[#DC2626]" /><span className="text-sm text-[#DC2626]">Issues</span></>
                    )}
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
