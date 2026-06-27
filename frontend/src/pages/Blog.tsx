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
      <SEOHead title="Blog - Cybersecurity News & Scam Alerts" description="Latest cybersecurity news, scam alerts, phishing warnings, and tips to stay safe online. Updated regularly by TrustLens security experts." canonical="https://trustlens.app/blog" />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Blog' }]} />
        <div className="max-w-5xl mx-auto">
          <h1 className="font-heading font-700 text-2xl md:text-3xl text-[#0F172A] mb-2">Blog</h1>
          <p className="text-[#475569] mb-6">Cybersecurity news, scam alerts, and tips to stay safe online.</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-sm rounded-xl transition-colors ${
                  category === cat ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#475569] hover:text-[#2563EB]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading && <BlogSkeleton />}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.items?.map((post: any) => (
              <Link key={post._id} to={`/blog/${post.slug}`} className="card hover:shadow-card-hover transition-all duration-200 group">
                <div className="h-48 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-4xl font-heading font-800 text-[#2563EB]/20">{post.title[0]}</span>
                </div>
                <span className="text-xs font-medium text-[#2563EB]">{post.category}</span>
                <h3 className="font-semibold text-[#0F172A] mt-1 mb-2 group-hover:text-[#2563EB] transition-colors">{post.title}</h3>
                <p className="text-sm text-[#475569] line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-[#475569]">
                  <span>{post.author}</span>
                  <span>&middot;</span>
                  <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}</span>
                </div>
              </Link>
            ))}
          </div>

          {data?.items?.length === 0 && (
            <Card><p className="text-center text-[#475569] py-8">No posts yet in this category.</p></Card>
          )}
        </div>
      </div>
    </>
  );
}
