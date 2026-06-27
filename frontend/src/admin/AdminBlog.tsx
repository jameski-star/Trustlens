import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit3, Loader2 } from 'lucide-react';
import apiClient from '../api/client';
import AdminLayout from './AdminLayout';
import BlogEditor from './BlogEditor';
import toast from 'react-hot-toast';

interface BlogPostItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminBlog() {
  const queryClient = useQueryClient();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPostItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/blog');
      return data.data as { items: BlogPostItem[] };
    },
  });

  const openEditor = (post?: BlogPostItem) => {
    setEditingPost(post || null);
    setEditorOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-700 text-2xl text-[#0F172A]">Blog Posts</h1>
          <p className="text-sm text-[#475569] mt-1">Create and manage blog content</p>
        </div>
        <button onClick={() => openEditor()} className="btn-primary text-sm gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className="text-left px-4 py-3 font-medium text-[#475569]">Title</th>
                <th className="text-left px-4 py-3 font-medium text-[#475569]">Category</th>
                <th className="text-left px-4 py-3 font-medium text-[#475569]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[#475569]">Date</th>
                <th className="text-right px-4 py-3 font-medium text-[#475569]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-12">
                    <div className="flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
                    </div>
                  </td>
                </tr>
              )}
              {data?.items.map(post => (
                <tr key={post._id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#0F172A] truncate max-w-xs">{post.title}</p>
                    <p className="text-xs text-[#475569]">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-[#F1F5F9] px-2 py-0.5 rounded-lg text-[#475569]">{post.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                      post.isPublished ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FFFBEB] text-[#D97706]'
                    }`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#475569]">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEditor(post)} className="p-2 rounded-lg text-[#475569] hover:bg-[#F1F5F9] transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#475569]">No blog posts yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editorOpen && (
        <BlogEditor
          post={editingPost}
          onClose={() => { setEditorOpen(false); setEditingPost(null); queryClient.invalidateQueries({ queryKey: ['admin-blog'] }); }}
        />
      )}
    </AdminLayout>
  );
}
