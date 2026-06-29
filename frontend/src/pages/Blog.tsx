import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogPosts } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import { BlogSkeleton } from '../components/Skeleton';

const categories = ['All', 'Phishing', 'Crypto', 'Job Scams', 'SMS Scams', 'Romance Scams', 'Investment', 'Identity Theft', 'Online Safety'];

export default function Blog() {
  const [category, setCategory] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['blog-posts', category],
    queryFn: () => getBlogPosts({ page: 1, category: category === 'All' ? undefined : category }),
  });

  return (
    <>
      <SEOHead title="Blog - Cybersecurity News & Scam Alerts" description="Latest cybersecurity news, scam alerts, phishing warnings, and tips to stay safe online. Updated regularly by TrustLens security experts." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Blog' }]} />
        <div className="max-w-5xl mx-auto">
          <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)] mb-2">Blog</h1>
          <p className="text-[var(--text-secondary)] mb-6">Cybersecurity news, scam alerts, and tips to stay safe online.</p>

          <div className="mb-8">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input-field sm:hidden"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="hidden sm:flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-sm rounded-xl transition-colors ${
                    category === cat ? 'bg-[#2563EB] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-accent)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading && <BlogSkeleton />}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items?.map((post: any) => (
              <Link key={post._id} to={`/blog/${post.slug}`} className="card hover:shadow-card-hover transition-all duration-200 group">
                <div className="h-48 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-4xl font-heading font-800 text-[var(--text-accent)]/20">{post.title[0]}</span>
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

          {data?.items?.length === 0 && (
            <Card><p className="text-center text-[var(--text-secondary)] py-8">No posts yet in this category.</p></Card>
          )}
        </div>
      </div>
    </>
  );
}
