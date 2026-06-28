import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getKnowledgeArticle } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import { ReportSkeleton } from '../components/Skeleton';
import Breadcrumbs from '../components/Breadcrumbs';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { renderMarkdown } from '../utils/markdown';

export default function KnowledgeArticle() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['knowledge-article', slug],
    queryFn: () => getKnowledgeArticle(slug!),
    enabled: !!slug,
  });

  return (
    <>
      <SEOHead
        title={(article?.title || 'Knowledge Article') + ' - TrustLens'}
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
            <p className="text-[#475569] mb-4">Article not found</p>
            <Link to="/knowledge-center" className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Knowledge Center
            </Link>
          </Card>
        )}

        {article && (
          <article className="max-w-3xl mx-auto">
            <h1 className="font-heading font-700 text-xl md:text-4xl text-[#0F172A] mb-4">{article.title}</h1>
            <p className="text-lg text-[#475569] mb-8">{article.excerpt}</p>

            <Card className="mb-8">
              <div className="prose prose-sm md:prose-base max-w-none text-[#475569]" dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }} />
            </Card>

            <div className="text-center py-8 border-t border-[#E2E8F0]">
              <Link to="/knowledge-center" className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Knowledge Center
              </Link>
            </div>
          </article>
        )}
      </div>
    </>
  );
}
