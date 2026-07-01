import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getKnowledgeArticle } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import { ReportSkeleton } from '../components/Skeleton';
import Breadcrumbs from '../components/Breadcrumbs';
import { ArrowLeft, BookOpen, Shield } from 'lucide-react';
import { renderMarkdown } from '../utils/markdown';
import { SITE_URL } from '../config';

export default function KnowledgeArticle() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error, refetch } = useQuery({
    queryKey: ['knowledge-article', slug],
    queryFn: () => getKnowledgeArticle(slug!),
    enabled: !!slug,
    retry: 2,
    staleTime: 30000,
  });
  
  const readingTime = article?.content 
    ? Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200))
    : null;

  return (
    <>
      <SEOHead
        title={article?.title || 'Knowledge Article'}
        description={article?.excerpt || ''}
      />
      <div className="container-page py-8">
        <Breadcrumbs items={[
          { label: 'Knowledge Center', href: '/knowledge-center' },
          { label: article?.title || slug || '' },
        ]} />

        {isLoading && <ReportSkeleton />}

        {error && (
          <Card className="max-w-lg mx-auto text-center py-12">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-[var(--text-secondary)] mb-2">Could not load article</p>
            <p className="text-sm text-[#94A3B8] mb-4">The article may not exist or the server is unreachable.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => refetch()} className="text-sm font-medium text-[var(--text-accent)] hover:text-[#1D4ED8] transition-colors">
                Try again
              </button>
              <Link to="/knowledge-center" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Knowledge Center
              </Link>
            </div>
          </Card>
        )}

        {article && (
          <article className="max-w-3xl mx-auto">
            <h1 className="font-heading font-700 text-xl md:text-4xl text-[var(--text-primary)] mb-5 text-wrap: balance">{article.title}</h1>
            <p className="text-lg text-[var(--text-secondary)] mb-6 leading-relaxed">{article.excerpt}</p>
            
            <div className="editorial-meta mb-8">
              <span className="editorial-badge editorial-badge-trust">
                <Shield className="w-3 h-3" />
                Verified Content
              </span>
              <span className="editorial-badge trust-badge-neutral">TrustLens Editorial</span>
              <span className="reading-time">{readingTime} min read</span>
            </div>

            <Card className="mb-8 overflow-hidden border border-[var(--border)] shadow-sm">
              <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }} />
            </Card>

            <div className="flex items-center justify-between py-6 border-t border-[var(--border)] text-sm text-[var(--text-secondary)]">
              <span>Published by TrustLens Security Team</span>
              {article.updatedAt && (
                <span className="last-reviewed">
                  Last updated: {new Date(article.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'TechArticle',
                headline: article.title,
                description: article.excerpt,
                author: { '@type': 'Organization', name: 'TrustLens' },
                publisher: { '@type': 'Organization', name: 'TrustLens', logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` } },
                datePublished: article.createdAt,
                dateModified: article.updatedAt || article.createdAt,
                mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/knowledge-center/${article.slug}` },
                about: article.category,
                proficiencyLevel: 'Beginner',
              }),
            }} />
            <div className="text-center py-8 border-t border-[var(--border)]">
              <Link to="/knowledge-center" className="text-sm font-medium text-[var(--text-accent)] hover:text-[#1D4ED8] flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Knowledge Center
              </Link>
            </div>
          </article>
        )}
      </div>
    </>
  );
}
