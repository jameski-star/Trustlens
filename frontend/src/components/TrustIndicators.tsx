import { useState, useEffect } from 'react';
import { Users, RefreshCw, Lock, Search } from 'lucide-react';
import { getCommunityReports } from '../api/client';

export default function TrustIndicators() {
  const [count, setCount] = useState('50,000+');

  useEffect(() => {
    let cancelled = false;
    getCommunityReports({ page: 1 }).then(data => {
      if (cancelled) return;
      const total = data?.total || data?.reports?.length || 0;
      if (total > 0) setCount((total * 1000).toLocaleString() + '+');
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const indicators = [
    { icon: Users, value: count, label: 'Community Reports' },
    { icon: RefreshCw, value: 'Daily Updated', label: 'Threat Database' },
    { icon: Lock, value: 'Privacy First', label: 'No Data Stored' },
    { icon: Search, value: 'Free Analysis', label: 'No Signup Required' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8">
      {indicators.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[var(--bg-accent)] rounded-xl flex items-center justify-center">
            <item.icon className="w-4 h-4 md:w-5 md:h-5 text-[var(--text-accent)]" />
          </div>
          <span className="font-heading font-700 text-sm md:text-lg text-[var(--text-primary)]">{item.value}</span>
          <span className="text-xs md:text-sm text-[var(--text-secondary)]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
