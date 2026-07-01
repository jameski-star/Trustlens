import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogPost } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import { ReportSkeleton } from '../components/Skeleton';
import Breadcrumbs from '../components/Breadcrumbs';
import { Calendar, User, ArrowLeft, ExternalLink, Shield } from 'lucide-react';
import { SITE_URL } from '../config';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getBlogPost(slug!),
    enabled: !!slug,
    staleTime: 300_000,
  });

  const isFromRss = post?.author === 'TrustLens Security Team';
  
  const readingTime = post?.content 
    ? Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200))
    : null;

  return (
    <>
      <SEOHead
        title={post?.seo?.metaTitle || post?.title || 'Blog Post'}
        description={post?.seo?.metaDescription || post?.excerpt || ''}
        canonical={post?.seo?.canonicalUrl || `${window.location.origin}/blog/${slug}`}
      />
      <div className="container-page py-8">
        <Breadcrumbs items={[
          { label: 'Blog', href: '/blog' },
          { label: post?.title || slug || '' },
        ]} />

        {isLoading && <ReportSkeleton />}

        {error && (
          <Card className="max-w-lg mx-auto text-center py-12">
            <p className="text-[var(--text-secondary)] mb-4">Post not found</p>
            <Link to="/blog" className="text-sm font-medium text-[var(--text-accent)] hover:text-[#1D4ED8] flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </Card>
        )}

        {post && (
          <article className="max-w-3xl mx-auto">
            <h1 className="font-heading font-700 text-xl md:text-4xl text-[var(--text-primary)] mb-5 text-wrap: balance">{post.title}</h1>
            
            <div className="editorial-meta mb-6">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="separator">&middot;</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unpublished'}
              </span>
              {readingTime && (
                <>
                  <span className="separator">&middot;</span>
                  <span className="reading-time">{readingTime} min read</span>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="editorial-badge editorial-badge-trust">
                <Shield className="w-3 h-3" />
                Verified Content
              </span>
              <span className="editorial-badge trust-badge-neutral">TrustLens Editorial</span>
              {post.category && (
                <span className="text-xs bg-[var(--bg-subtle)] px-2 py-1 rounded-lg text-[var(--text-secondary)]">{post.category}</span>
              )}
            </div>

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-[var(--bg-subtle)] px-2 py-1 rounded-lg text-[var(--text-secondary)]">{tag}</span>
                ))}
              </div>
            )}

            {post.coverImage && (
              <img src={post.coverImage} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8" loading="lazy" />
            )}

            <Card className="mb-8 overflow-hidden border border-[var(--border)] shadow-sm">
              <div
                className="
                  prose prose-slate max-w-none dark:prose-invert
                  text-[var(--text-secondary)] leading-relaxed antialiased

                  prose-headings:font-heading prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[var(--text-primary)]
                  prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 md:prose-h2:text-2xl
                  prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3

                  prose-p:text-base prose-p:mb-5 prose-p:leading-8

                  prose-a:text-[var(--text-accent)] prose-a:font-medium prose-a:no-underline hover:prose-a:underline

                  prose-code:bg-[var(--bg-subtle)] prose-code:text-[#DC2626] dark:prose-code:text-[#F87171]
                  prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']

                  prose-ol:list-decimal prose-ol:pl-5 prose-ol:mb-5
                  prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-5
                  prose-li:my-1.5 prose-li:text-[var(--text-secondary)]
                  prose-blockquote:border-l-4 prose-blockquote:border-[var(--text-accent)] prose-blockquote:bg-[var(--bg-muted)] prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:rounded-r-xl
                "
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              {isFromRss && post.seo?.canonicalUrl && (
                <div className="mt-8 pt-6 border-t border-[var(--border)]">
                  <a
                    href={post.seo.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-accent)] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Read Full Story
                  </a>
                </div>
              )}
            </Card>

            <div className="flex items-center justify-between py-6 border-t border-[var(--border)] text-sm text-[var(--text-secondary)]">
              <span>Published by TrustLens Security Team</span>
              {post.updatedAt && (
                <span className="last-reviewed">
                  Last updated: {new Date(post.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </div>

            <script type="application/ld+json" dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: post.title,
                description: post.excerpt,
                image: post.coverImage || undefined,
                author: { '@type': 'Organization', name: post.author },
                publisher: { '@type': 'Organization', name: 'TrustLens', logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` } },
                datePublished: post.publishedAt,
                dateModified: post.updatedAt || post.publishedAt,
                mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
                keywords: post.tags?.join(', ') || post.category,
                articleSection: post.category,
              }),
            }} />
          </article>
        )}
      </div>
    </>
  );
}
