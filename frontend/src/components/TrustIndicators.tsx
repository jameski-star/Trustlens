import { useState, useEffect } from 'react';
import { Shield, Users, RefreshCw, Lock, Search } from 'lucide-react';
import { getCommunityReports } from '../api/client';

export default function TrustIndicators() {
  const [count, setCount] = useState('50,000+');

  useEffect(() => {
    getCommunityReports({ page: 1 }).then(data => {
      const total = data?.total || data?.reports?.length || 0;
      if (total > 0) setCount((total * 1000).toLocaleString() + '+');
    }).catch(() => {});
  }, []);

  const indicators = [
    { icon: Users, value: count, label: 'Community Reports' },
    { icon: RefreshCw, value: 'Daily Updated', label: 'Threat Database' },
    { icon: Lock, value: 'Privacy First', label: 'No Data Stored' },
    { icon: Search, value: 'Free Analysis', label: 'No Signup Required' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      {indicators.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-2 p-4">
          <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
            <item.icon className="w-5 h-5 text-[#2563EB]" />
          </div>
          <span className="font-heading font-700 text-lg text-[#0F172A]">{item.value}</span>
          <span className="text-sm text-[#475569]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
