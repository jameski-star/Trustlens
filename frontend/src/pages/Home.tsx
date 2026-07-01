import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Search, FileText, MessageSquare, Camera, QrCode, Flag, ShieldCheck, Lock, Server, Shield } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import SearchBar from '../components/SearchBar';
import { getBlogPosts, getTrendingScams } from '../api/client';

const tools = [
  { icon: Search, title: 'URL Checker', desc: 'Check if a website is safe or fraudulent', href: '/url-checker' },
  { icon: MessageSquare, title: 'Email Checker', desc: 'Analyze emails for phishing attempts', href: '/email-checker' },
  { icon: FileText, title: 'SMS Checker', desc: 'Verify SMS messages for scams', href: '/sms-checker' },
  { icon: Camera, title: 'Screenshot Scanner', desc: 'Scan screenshots for threats', href: '/screenshot-scanner' },
  { icon: QrCode, title: 'QR Code Scanner', desc: 'Analyze QR codes before scanning', href: '/qr-scanner' },
  { icon: Flag, title: 'Community Reports', desc: 'See what others are reporting', href: '/community-reports' },
];

const trustParams = [
  { icon: ShieldCheck, label: 'Enterprise-grade security', detail: 'Multi-layer threat detection engine' },
  { icon: Lock, label: 'SOC 2 Compliant', detail: 'Stringent data protection standards' },
  { icon: Server, label: 'Audited', detail: 'Independently verified security controls' },
  { icon: Shield, label: 'Privacy by Design', detail: 'No personal data stored or shared' },
];

export default function Home() {
  const { data: blogData } = useQuery({
    queryKey: ['blog-posts', 'home'],
    queryFn: () => getBlogPosts({ page: 1, limit: 3 }),
    staleTime: 2 * 60 * 1000,
  });
  const { data: trends } = useQuery({
    queryKey: ['trending-scams', 'home'],
    queryFn: getTrendingScams,
    staleTime: 5 * 60 * 1000,
  });

  const blogPosts = blogData?.items ?? [];
  const popularSearches = trends?.length ? trends : [];

  return (
    <>
      <SEOHead
        title="Know Before You Click"
        description="TrustLens helps you determine if websites, emails, SMS messages, and online offers are safe or potentially fraudulent."
      />

      <section className="container-page pt-[4vh] pb-1 md:pt-12 md:pb-6">
        <div className="text-center mb-3 md:mb-6 max-w-3xl mx-auto">
          <h1 className="font-heading font-700 text-[clamp(1.5rem,1rem+3vw,3rem)] md:text-6xl leading-[1.05] mb-1.5 md:mb-3">
            <span className="block text-[var(--text-primary)] tracking-tight">Know Before</span>
            <span className="block text-[var(--text-accent)] tracking-tight">You Click</span>
          </h1>
          <div className="mx-auto mt-3 md:mt-4 mb-2 md:mb-4 h-0.5 w-12 md:w-16 bg-[var(--text-accent)]/80 rounded-full" />
          <p className="text-xs md:text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-2 md:mb-4">
            Security analysis for websites, emails, SMS messages, and more.
          </p>
          <div className="max-w-xl mx-auto">
            <SearchBar large />
          </div>
        </div>
      </section>

      <section className="container-page pb-4 md:pb-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 max-w-3xl mx-auto">
          {trustParams.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs md:text-sm text-[var(--text-secondary)]">
              <item.icon className="w-4 h-4 text-[var(--text-accent)]" />
              <span className="font-medium text-[var(--text-primary)]">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--bg-muted)] border-y border-[var(--border)]">
        <div className="container-page py-3 md:py-6">
          <div className="mx-auto">
            <h2 className="font-heading font-600 text-sm md:text-lg text-[var(--text-primary)] mb-2 md:mb-4 text-center">Security Tools</h2>
            <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3 lg:grid-cols-6">
              {tools.map((tool) => (
                <Link key={tool.href} to={tool.href} className="block p-2.5 md:p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl hover:border-[var(--text-accent)] transition-colors duration-150">
                  <div className="w-7 h-7 md:w-9 md:h-9 bg-[var(--bg-accent)] rounded-lg flex items-center justify-center mb-1.5 md:mb-2 mx-auto md:mx-0">
                    <tool.icon className="w-3.5 h-3.5 md:w-5 md:h-5 text-[var(--text-accent)]" />
                  </div>
                  <h3 className="font-medium text-[11px] md:text-sm text-[var(--text-primary)] leading-tight text-center md:text-left">{tool.title}</h3>
                  <p className="text-[10px] md:text-xs text-[var(--text-secondary)] mt-0.5 leading-tight hidden md:block">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-4 md:py-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-heading font-600 text-base md:text-lg text-[var(--text-primary)] mb-3">Trending Searches</h2>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {popularSearches.length > 0 ? popularSearches.map((item: Record<string, unknown>) => {
              const label = (item._id as string) || (item.type as string) || '';
              return (
                <Link
                  key={label}
                  to={`/url-checker?q=${encodeURIComponent(label)}`}
                  className="px-2.5 py-1 text-xs md:text-sm text-[var(--text-secondary)] bg-[var(--bg-subtle)] hover:text-[var(--text-accent)] hover:bg-[var(--bg-accent)] rounded-lg transition-colors duration-150 truncate max-w-[150px] md:max-w-none"
                >
                  {label}
                </Link>
              );
            }) : (
              <span className="text-xs md:text-sm text-[var(--text-secondary)]">No search data yet</span>
            )}
          </div>
        </div>
      </section>

      <section className="container-page pb-4 md:pb-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="font-heading font-600 text-base md:text-lg text-[var(--text-primary)]">Latest Insights</h2>
            <Link to="/blog" className="text-xs md:text-sm font-medium text-[var(--text-accent)] flex items-center gap-0.5">
              View all <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            {blogPosts.length > 0 ? blogPosts.map((article) => (
              <Link key={article._id as string} to={`/blog/${article.slug as string}`} className="block p-3 md:p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl hover:border-[var(--text-accent)] transition-colors duration-150">
                <span className="text-[10px] md:text-xs font-medium text-[var(--text-accent)]">{article.category as string}</span>
                <h3 className="font-medium text-xs md:text-sm text-[var(--text-primary)] mt-1 leading-snug">{article.title as string}</h3>
                <span className="text-[10px] md:text-xs text-[var(--text-secondary)] mt-1 block">{new Date(article.createdAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </Link>
            )) : (
              <p className="text-xs md:text-sm text-[var(--text-secondary)] col-span-3">No articles yet</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-muted)] border-y border-[var(--border)]">
        <div className="container-page py-6 md:py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading font-700 text-lg md:text-2xl text-[var(--text-primary)] mb-2">Join the Community</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-xl mx-auto">Help protect others by reporting suspicious websites, emails, and messages.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/community-reports" className="btn-primary w-full sm:w-auto">Start Reporting</Link>
              <Link to="/about" className="btn-secondary w-full sm:w-auto">Learn More</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)]">
        <div className="container-page py-6 md:py-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm md:text-base text-[var(--text-secondary)]">
              Security analysis platform.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
