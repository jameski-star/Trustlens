import { Lock, ShieldCheck, Server, Shield } from 'lucide-react';

const trustParams = [
  { icon: ShieldCheck, label: 'Enterprise-grade security', detail: 'Multi-layer threat detection engine' },
  { icon: Lock, label: 'SOC 2 Compliant', detail: 'Stringent data protection standards' },
  { icon: Server, label: 'Audited', detail: 'Independently verified security controls' },
  { icon: Shield, label: 'Privacy by Design', detail: 'No personal data stored or shared' },
];

export default function TrustIndicators() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[var(--border)]">
        {trustParams.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1.5 md:gap-2 p-4 md:p-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[var(--bg-accent)] rounded-lg flex items-center justify-center">
              <item.icon className="w-4 h-4 md:w-5 md:h-5 text-[var(--text-accent)]" />
            </div>
            <span className="font-heading font-600 text-xs md:text-sm text-[var(--text-primary)] leading-tight">{item.label}</span>
            <span className="text-[10px] md:text-xs text-[var(--text-secondary)] leading-tight">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
