import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogPost } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import { ReportSkeleton } from '../components/Skeleton';
import Breadcrumbs from '../components/Breadcrumbs';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getBlogPost(slug!),
    enabled: !!slug,
  });

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
            <h1 className="font-heading font-700 text-xl md:text-4xl text-[var(--text-primary)] mb-4">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)] mb-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unpublished'}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                {post.category}
              </span>
            </div>

            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="text-xs bg-[var(--bg-subtle)] px-2 py-1 rounded-lg text-[var(--text-secondary)]">{tag}</span>
                ))}
              </div>
            )}

            {post.coverImage && (
              <img src={post.coverImage} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8" />
            )}

            <Card className="mb-8">
              <div className="prose prose-sm max-w-none text-[var(--text-secondary)] leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
            </Card>

            <script type="application/ld+json" dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: post.title,
                description: post.excerpt,
                author: { '@type': 'Person', name: post.author },
                datePublished: post.publishedAt,
              }),
            }} />
          </article>
        )}
      </div>
    </>
  );
}
