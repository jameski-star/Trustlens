import { useState, useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogPosts } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import { BlogSkeleton } from '../components/Skeleton';
import { Loader2 } from 'lucide-react';
import { SITE_URL } from '../config';

interface BlogPostItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  coverImage: string;
}

function itemsReducer(state: BlogPostItem[], action: { items: BlogPostItem[]; page: number }) {
  if (action.page === 1) return action.items;
  const existingIds = new Set(state.map(p => p._id));
  const newItems = action.items.filter(i => !existingIds.has(i._id));
  return [...state, ...newItems];
}

const categories = ['All', 'Phishing', 'Crypto', 'Job Scams', 'SMS Scams', 'Romance Scams', 'Investment', 'Identity Theft', 'Online Safety'];

export default function Blog() {
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [allItems, dispatch] = useReducer(itemsReducer, []);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['blog-posts', category, page],
    queryFn: () => getBlogPosts({ page, category: category === 'All' ? undefined : category }),
    staleTime: 120_000,
  });

  useEffect(() => {
    if (data?.items) {
      dispatch({ items: data.items as unknown as BlogPostItem[], page });
    }
  }, [data, page]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
    dispatch({ items: [], page: 1 });
  };

  const total = data?.total ?? 0;
  const hasMore = allItems.length < total;

  return (
    <>
      <SEOHead title="Blog - Cybersecurity News & Scam Alerts" description="Latest cybersecurity news, scam alerts, phishing warnings, and tips to stay safe online. Updated regularly by TrustLens security experts." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Blog' }]} />
        <div className="mx-auto max-w-6xl">
          <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)] mb-2">Blog</h1>
          <p className="text-[var(--text-secondary)] mb-6">Cybersecurity news, scam alerts, and tips to stay safe online.</p>

          {total > 0 && (
            <p className="text-xs text-[var(--text-secondary)] mb-4">{total} post{total !== 1 ? 's' : ''}</p>
          )}

          <div className="mb-8">
            <select
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              className="input-field sm:hidden"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="hidden sm:flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 text-sm rounded-xl transition-colors ${
                    category === cat ? 'bg-[#2563EB] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-accent)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading && page === 1 && <BlogSkeleton />}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allItems.map((post: BlogPostItem) => (
              <Link key={post._id} to={`/blog/${post.slug}`} className="card hover:shadow-card-hover transition-all duration-200 group">
                <div className="h-48 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-4xl font-heading font-800 text-[var(--text-accent)]/20">{post.title[0] || '?'}</span>
                </div>
                <span className="text-xs font-medium text-[var(--text-accent)]">{post.category}</span>
                <h3 className="font-semibold text-[var(--text-primary)] mt-1 mb-2 group-hover:text-[var(--text-accent)] transition-colors">{post.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-[var(--text-secondary)]">
                  <span>{post.author}</span>
                  <span>&middot;</span>
                  <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</span>
                </div>
              </Link>
            ))}
          </div>

          {allItems.length === 0 && !isLoading && (
            <Card><p className="text-center text-[var(--text-secondary)] py-8">No posts yet in this category.</p></Card>
          )}

          {hasMore && (
            <div className="text-center mt-10">
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={isFetching}
                className="btn-secondary"
              >
                {isFetching ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</span>
                ) : (
                  'View More Posts'
                )}
              </button>
            </div>
          )}
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: allItems.map((post, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'BlogPosting',
                headline: post.title,
                url: `${SITE_URL}/blog/${post.slug}`,
                author: post.author,
                datePublished: post.publishedAt,
              },
            })),
          }),
        }} />
      </div>
    </>
  );
}
