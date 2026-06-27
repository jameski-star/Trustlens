import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

const categories = [
  'Phishing', 'Crypto Scams', 'Job Scams', 'Investment Fraud',
  'AI Scams', 'Romance Scams', 'Identity Theft', 'QR Scams',
  'Tax Scams', 'Travel Scams', 'Scam Alert', 'Security News',
];

interface BlogPostData {
  _id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  coverImage?: string;
  isPublished?: boolean;
}

interface BlogEditorProps {
  post: BlogPostData | null;
  onClose: () => void;
}

export default function BlogEditor({ post, onClose }: BlogEditorProps) {
  const queryClient = useQueryClient();
  const isEdit = !!post?._id;

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', category: '',
    tags: '' as string, coverImage: '', isPublished: false,
  });
  const [tagList, setTagList] = useState<string[]>([]);

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category || '',
        tags: (post.tags || []).join(', '),
        coverImage: post.coverImage || '',
        isPublished: post.isPublished || false,
      });
      setTagList(post.tags || []);
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        await apiClient.put(`/admin/blog/${post._id}`, data);
      } else {
        await apiClient.post('/admin/blog', data);
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Post updated' : 'Post created');
      onClose();
    },
    onError: () => toast.error('Failed to save post'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    mutation.mutate({
      ...form,
      tags,
      coverImage: form.coverImage || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20 flex items-start justify-center overflow-y-auto pt-8 pb-8">
      <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-full max-w-3xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="font-heading font-700 text-lg text-[#0F172A]">
            {isEdit ? 'Edit Post' : 'New Blog Post'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Title</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Slug</label>
            <div className="flex gap-2">
              <input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="input-field flex-1"
                placeholder="my-blog-post"
                required
              />
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, slug: generateSlug(f.title) }))}
                className="px-3 py-2 text-sm text-[#2563EB] hover:bg-[#EFF6FF] rounded-xl transition-colors"
              >
                Generate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              className="input-field"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Content (Markdown)</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="input-field font-mono text-sm"
              rows={12}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="input-field"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F172A] mb-1">Cover Image URL</label>
              <input
                value={form.coverImage}
                onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                className="input-field"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1">Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              className="input-field"
              placeholder="phishing, security, crypto"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
              className="w-4 h-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-sm text-[#0F172A]">Publish immediately</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary text-sm">
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
