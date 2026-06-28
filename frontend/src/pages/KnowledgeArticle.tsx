import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getKnowledgeArticle } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import { ReportSkeleton } from '../components/Skeleton';
import Breadcrumbs from '../components/Breadcrumbs';
import { ArrowLeft, BookOpen } from 'lucide-react';

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
            <h1 className="font-heading font-700 text-2xl md:text-4xl text-[#0F172A] mb-4">{article.title}</h1>
            <p className="text-lg text-[#475569] mb-8">{article.excerpt}</p>

            <Card className="mb-8">
              <div className="prose prose-sm md:prose-base max-w-none text-[#475569]">
                {article.content.split('\n').map((line: string, i: number) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-xl font-semibold text-[#0F172A] mt-8 mb-4">{line.slice(3)}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-lg font-semibold text-[#0F172A] mt-6 mb-3">{line.slice(4)}</h3>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-semibold text-[#0F172A] mt-4 mb-2">{line.slice(2, -2)}</p>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-6 text-[#475569] list-disc">{line.slice(2)}</li>;
                  }
                  if (line.startsWith('1. ')) {
                    return <li key={i} className="ml-6 text-[#475569] list-decimal">{line.slice(3)}</li>;
                  }
                  if (line.trim() === '') {
                    return <div key={i} className="h-4" />;
                  }
                  return <p key={i} className="text-[#475569] mb-3 leading-relaxed">{line}</p>;
                })}
              </div>
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
