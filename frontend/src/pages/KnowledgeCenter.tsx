import { Link } from 'react-router-dom';
import { BookOpen, Shield, CreditCard, Users, Globe, MessageSquare, QrCode, Briefcase, Heart } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';

const categories = [
  { icon: Shield, title: 'Phishing', desc: 'How to identify and avoid phishing attacks', href: '/knowledge-center/phishing-attacks' },
  { icon: CreditCard, title: 'Crypto Scams', desc: 'Cryptocurrency investment fraud awareness', href: '/knowledge-center/crypto-scams' },
  { icon: Briefcase, title: 'Job Scams', desc: 'Fake job offers and employment fraud', href: '/knowledge-center/job-scams' },
  { icon: MessageSquare, title: 'SMS Scams', desc: 'Text message and WhatsApp fraud', href: '/knowledge-center/sms-scams' },
  { icon: Heart, title: 'Romance Scams', desc: 'Dating and relationship fraud', href: '/knowledge-center/romance-scams' },
  { icon: Globe, title: 'Investment Fraud', desc: 'Ponzi schemes and fake investments', href: '/knowledge-center/investment-fraud' },
  { icon: Users, title: 'Identity Theft', desc: 'Protecting your personal information', href: '/knowledge-center/identity-theft' },
  { icon: Shield, title: 'Online Safety', desc: 'General cybersecurity best practices', href: '/knowledge-center/online-safety' },
];

export default function KnowledgeCenter() {
  return (
    <>
      <SEOHead title="Knowledge Center - Cybersecurity Education" description="Learn how to protect yourself from online scams, phishing, identity theft, and cybersecurity threats. Free educational resources." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Knowledge Center' }]} />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--bg-accent)] rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5 text-[var(--text-accent)]" /></div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">Knowledge Center</h1>
          </div>
          <p className="text-[var(--text-secondary)] mb-8">Learn how to protect yourself from online scams, phishing, identity theft, and other cybersecurity threats.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Link key={cat.title} to={cat.href} className="card hover:shadow-card-hover transition-all duration-200 group">
                <div className="w-10 h-10 bg-[var(--bg-accent)] rounded-xl flex items-center justify-center mb-3">
                  <cat.icon className="w-5 h-5 text-[var(--text-accent)]" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--text-accent)] transition-colors mb-1">{cat.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
