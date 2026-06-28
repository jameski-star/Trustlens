import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Search, FileText, MessageSquare, Camera, QrCode, TrendingUp, BookOpen, Flag } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import SearchBar from '../components/SearchBar';
import TrustIndicators from '../components/TrustIndicators';

const tools = [
  { icon: Search, title: 'URL Checker', desc: 'Check if a website is safe or fraudulent', href: '/url-checker', color: 'bg-[#EFF6FF] text-[#2563EB]' },
  { icon: MessageSquare, title: 'Email Checker', desc: 'Analyze emails for phishing attempts', href: '/email-checker', color: 'bg-[#F0FDF4] text-[#16A34A]' },
  { icon: FileText, title: 'SMS Checker', desc: 'Verify SMS messages for scams', href: '/sms-checker', color: 'bg-[#FFFBEB] text-[#D97706]' },
  { icon: Camera, title: 'Screenshot Scanner', desc: 'Scan screenshots for threats', href: '/screenshot-scanner', color: 'bg-[#FEF2F2] text-[#DC2626]' },
  { icon: QrCode, title: 'QR Code Scanner', desc: 'Analyze QR codes before scanning', href: '/qr-scanner', color: 'bg-[#F5F3FF] text-[#7C3AED]' },
  { icon: Flag, title: 'Community Reports', desc: 'See what others are reporting', href: '/community-reports', color: 'bg-[#ECFEFF] text-[#0891B2]' },
];

const articles = [
  { title: 'How to Spot Phishing Emails in 2024', category: 'Phishing', href: '/blog/how-to-spot-phishing-emails', date: 'Dec 15, 2024' },
  { title: 'Crypto Scams: What to Look For', category: 'Crypto', href: '/blog/crypto-scams-what-to-look-for', date: 'Dec 12, 2024' },
  { title: 'SMS Scams Are on the Rise: Stay Protected', category: 'Scam Alert', href: '/blog/sms-scams-are-on-the-rise', date: 'Dec 10, 2024' },
];

export default function Home() {
  return (
    <>
      <SEOHead
        title="Know Before You Click"
        description="TrustLens helps you determine if websites, emails, SMS messages, and online offers are safe or potentially fraudulent. Free security analysis."
      />

      <section className="container-page pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="font-heading font-800 text-[clamp(1.75rem,1.25rem+3vw,3.75rem)] md:text-5xl lg:text-6xl text-[#0F172A] leading-tight mb-4">
            Know Before<br />
            <span className="text-[#2563EB]">You Click</span>
          </h1>
          <p className="text-lg md:text-xl text-[#475569] max-w-2xl mx-auto mb-8">
            Free security analysis for websites, emails, SMS messages, and more.
            Protect yourself from scams and phishing attempts.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar large />
          </div>
        </div>
      </section>

      <section className="container-page pb-12">
        <TrustIndicators />
      </section>

      <section className="container-page pb-12">
        <h2 className="font-heading font-700 text-2xl text-[#0F172A] mb-6">Popular Searches</h2>
        <div className="flex flex-wrap gap-2">
          {['paypal-security.com', 'bank-verify.net', 'amazon-support.xyz', 'netflix-login.tk', 'apple-id-verify.com', 'secure-update.ga'].map((url) => (
            <Link
              key={url}
              to={`/url-checker?q=${encodeURIComponent(url)}`}
              className="px-3 py-1.5 text-sm text-[#475569] bg-[#F1F5F9] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-xl transition-colors truncate max-w-[200px] sm:max-w-none"
            >
              {url}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading font-700 text-2xl text-[#0F172A]">Security Tools</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link key={tool.href} to={tool.href} className="card hover:shadow-card-hover transition-shadow duration-150 group">
              <div className={`w-10 h-10 ${tool.color} rounded-xl flex items-center justify-center mb-3`}>
                <tool.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-1 group-hover:text-[#2563EB] transition-colors">{tool.title}</h3>
              <p className="text-sm text-[#475569]">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading font-700 text-2xl text-[#0F172A]">Latest Security Insights</h2>
          <Link to="/blog" className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.title} to={article.href} className="card hover:shadow-card-hover transition-all duration-200">
              <span className="text-xs font-medium text-[#2563EB]">{article.category}</span>
              <h3 className="font-semibold text-[#0F172A] mt-1 mb-2">{article.title}</h3>
              <span className="text-sm text-[#475569]">{article.date}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#F8FAFC] border-t border-[#E2E8F0]">
        <div className="container-page py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading font-700 text-2xl md:text-3xl text-[#0F172A] mb-4">
              Join the Community
            </h2>
            <p className="text-[#475569] mb-8 max-w-xl mx-auto">
              Help protect others by reporting suspicious websites, emails, and messages you encounter.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/community-reports" className="btn-primary">
                Start Reporting
              </Link>
              <Link to="/about" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'TrustLens',
          description: 'Free security analysis tool for websites, emails, SMS messages, and more.',
          url: window.location.origin,
          applicationCategory: 'Security Application',
          operatingSystem: 'All',
        }),
      }} />
    </>
  );
}
