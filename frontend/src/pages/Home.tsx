import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Search, FileText, MessageSquare, Camera, QrCode, Flag } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import SearchBar from '../components/SearchBar';
import TrustIndicators from '../components/TrustIndicators';
import { getBlogPosts, getTrendingScams } from '../api/client';

const tools = [
  { icon: Search, title: 'URL Checker', desc: 'Check if a website is safe or fraudulent', href: '/url-checker', color: 'bg-[var(--bg-accent)] text-[var(--text-accent)]' },
  { icon: MessageSquare, title: 'Email Checker', desc: 'Analyze emails for phishing attempts', href: '/email-checker', color: 'bg-[#F0FDF4] text-[#16A34A]' },
  { icon: FileText, title: 'SMS Checker', desc: 'Verify SMS messages for scams', href: '/sms-checker', color: 'bg-[#FFFBEB] text-[#D97706]' },
  { icon: Camera, title: 'Screenshot Scanner', desc: 'Scan screenshots for threats', href: '/screenshot-scanner', color: 'bg-[#FEF2F2] text-[#DC2626]' },
  { icon: QrCode, title: 'QR Code Scanner', desc: 'Analyze QR codes before scanning', href: '/qr-scanner', color: 'bg-[#F5F3FF] text-[#7C3AED]' },
  { icon: Flag, title: 'Community Reports', desc: 'See what others are reporting', href: '/community-reports', color: 'bg-[#ECFEFF] text-[#0891B2]' },
];

export default function Home() {
  const { data: blogData } = useQuery({
    queryKey: ['blog-posts', 'home'],
    queryFn: () => getBlogPosts({ page: 1, limit: 3 }),
    staleTime: 2 * 60 * 1000,
  });
  const { data: trends } = useQuery({
    queryKey: ['trending-scams', 'home'],
    queryFn: () => getTrendingScams(),
    staleTime: 5 * 60 * 1000,
  });

  const blogPosts = blogData?.items ?? [];
  const popularSearches = trends?.length ? trends : [];

  return (
    <>
      <SEOHead
        title="Know Before You Click"
        description="TrustLens helps you determine if websites, emails, SMS messages, and online offers are safe or potentially fraudulent. Free security analysis."
      />

      <section className="container-page pt-8 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="font-heading font-800 text-[clamp(1.5rem,1rem+3vw,3.75rem)] md:text-5xl lg:text-6xl text-[var(--text-primary)] leading-tight mb-3">
            Know Before<br />
            <span className="text-[var(--text-accent)]">You Click</span>
          </h1>
          <p className="text-base md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-6">
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
        <h2 className="font-heading font-700 text-2xl text-[var(--text-primary)] mb-6">Popular Searches</h2>
        <div className="flex flex-wrap gap-2">
          {popularSearches.length > 0 ? popularSearches.map((item) => {
            const label = (item as Record<string, string>)._id || (item as Record<string, string>).type || '';
            return (
              <Link
                key={label}
                to={`/url-checker?q=${encodeURIComponent(label)}`}
                className="px-3 py-1.5 text-sm text-[var(--text-secondary)] bg-[var(--bg-subtle)] hover:text-[var(--text-accent)] hover:bg-[var(--bg-accent)] rounded-xl transition-colors truncate max-w-[200px] sm:max-w-none"
              >
                {label}
              </Link>
            );
          }) : (
            <span className="text-sm text-[var(--text-secondary)]">No search data yet</span>
          )}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading font-700 text-2xl text-[var(--text-primary)]">Security Tools</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link key={tool.href} to={tool.href} className="card hover:shadow-card-hover transition-shadow duration-150 group">
              <div className={`w-10 h-10 ${tool.color} rounded-xl flex items-center justify-center mb-3`}>
                <tool.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--text-accent)] transition-colors">{tool.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading font-700 text-2xl text-[var(--text-primary)]">Latest Security Insights</h2>
          <Link to="/blog" className="text-sm font-medium text-[var(--text-accent)] hover:text-[#1D4ED8] flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.length > 0 ? blogPosts.map((article) => (
            <Link key={article._id as string} to={`/blog/${article.slug as string}`} className="card hover:shadow-card-hover transition-all duration-200">
              <span className="text-xs font-medium text-[var(--text-accent)]">{article.category as string}</span>
              <h3 className="font-semibold text-[var(--text-primary)] mt-1 mb-2">{article.title as string}</h3>
              <span className="text-sm text-[var(--text-secondary)]">{new Date(article.createdAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </Link>
          )) : (
            <p className="text-sm text-[var(--text-secondary)] col-span-3">No articles yet</p>
          )}
        </div>
      </section>

      <section className="bg-[var(--bg-muted)] border-t border-[var(--border)]">
        <div className="container-page py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)] mb-4">
              Join the Community
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
              Help protect others by reporting suspicious websites, emails, and messages you encounter.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/community-reports" className="btn-primary w-full sm:w-auto">
                Start Reporting
              </Link>
              <Link to="/about" className="btn-secondary w-full sm:w-auto">
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
