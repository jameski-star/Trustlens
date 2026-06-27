import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogPost } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import { ReportSkeleton } from '../components/Skeleton';
import Breadcrumbs from '../components/Breadcrumbs';
import { Calendar, User, Tag } from 'lucide-react';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getBlogPost(slug!),
    enabled: !!slug,
  });

  return (
    <>
      <SEOHead
        title={post?.seo?.metaTitle || post?.title || 'Blog Post'}
        description={post?.seo?.metaDescription || post?.excerpt || ''}
        canonical={post?.seo?.canonicalUrl || `https://trustlens.website/blog/${slug}`}
      />
      <div className="container-page py-8">
        <Breadcrumbs items={[
          { label: 'Blog', href: '/blog' },
          { label: post?.title || slug || '' },
        ]} />

        {isLoading && <ReportSkeleton />}

        {post && (
          <article className="max-w-3xl mx-auto">
            <h1 className="font-heading font-700 text-2xl md:text-4xl text-[#0F172A] mb-4">{post.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#475569] mb-2">
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
                  <span key={tag} className="text-xs bg-[#F1F5F9] px-2 py-1 rounded-lg text-[#475569]">{tag}</span>
                ))}
              </div>
            )}

            {post.coverImage && (
              <img src={post.coverImage} alt={post.title} className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8" />
            )}

            <Card className="mb-8">
              <p className="text-[#475569] mb-4">{post.excerpt}</p>
              <div className="prose prose-sm max-w-none text-[#475569] whitespace-pre-line">
                {post.content}
              </div>
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
