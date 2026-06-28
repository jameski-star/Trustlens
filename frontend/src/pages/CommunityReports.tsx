import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCommunityReports, createCommunityReport, upvoteCommunityReport } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import { CardSkeleton } from '../components/Skeleton';
import { Flag, Plus, X, Loader2, ThumbsUp, Image as ImageIcon, Upload, ShieldCheck, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const reportTypes = [
  { value: 'url', label: 'URL / Website' },
  { value: 'email', label: 'Email Address' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'whatsapp', label: 'WhatsApp Number' },
  { value: 'crypto', label: 'Crypto / Investment' },
  { value: 'investment', label: 'Investment Platform' },
];

const categories = [
  'Phishing',
  'Scam',
  'Spam',
  'Fake Website',
  'Fake Investment',
  'Identity Theft',
  'Tech Support Scam',
  'Romance Scam',
  'Job Scam',
  'Other',
];

export default function CommunityReports() {
  const [showForm, setShowForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [category, setCategory] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['community-reports', category],
    queryFn: () => getCommunityReports({ page: 1, category: category === 'All' ? undefined : category }),
  });

  const handleUpvote = async (id: string) => {
    try {
      await upvoteCommunityReport(id);
      queryClient.invalidateQueries({ queryKey: ['community-reports'] });
      toast.success('Upvoted!');
    } catch {
      toast.error('Failed to upvote');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(f.type));
    if (validFiles.length !== files.length) {
      toast.error('Only PNG, JPG, GIF, and WEBP images are allowed');
    }
    const remaining = 5 - selectedFiles.length;
    const toAdd = validFiles.slice(0, remaining);
    setSelectedFiles(prev => [...prev, ...toAdd]);
    for (const file of toAdd) {
      setUploadPreviews(prev => [...prev, URL.createObjectURL(file)]);
    }
    if (validFiles.length > remaining) {
      toast.error('Maximum 5 screenshots allowed');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetForm = () => {
    setSelectedFiles([]);
    uploadPreviews.forEach(u => URL.revokeObjectURL(u));
    setUploadPreviews([]);
  };

  const [formData, setFormData] = useState({
    type: '',
    target: '',
    title: '',
    category: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.type) errs.type = 'Type is required';
    if (!formData.target || formData.target.length < 1) errs.target = 'Target is required';
    if (!formData.title || formData.title.length < 3) errs.title = 'Title must be at least 3 characters';
    if (!formData.category) errs.category = 'Category is required';
    if (!formData.description || formData.description.length < 10) errs.description = 'Description must be at least 10 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('type', formData.type);
      fd.append('target', formData.target);
      fd.append('title', formData.title);
      fd.append('category', formData.category);
      fd.append('description', formData.description);
      selectedFiles.forEach(f => fd.append('screenshots', f));

      await createCommunityReport(fd);
      toast.success('Report submitted for review. Thank you!');
      setFormData({ type: '', target: '', title: '', category: '', description: '' });
      resetForm();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['community-reports'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead title="Community Reports - See What Others Are Reporting" description="Browse community-submitted reports of suspicious websites, emails, phone numbers, and scams." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Community Reports' }]} />
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="font-heading font-700 text-xl md:text-3xl text-[#0F172A]">Community Reports</h1>
              <p className="text-[#475569] mt-1">Browse reports submitted by the community about suspicious websites, emails, phone numbers, and more.</p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm whitespace-nowrap shrink-0">
              <Plus className="w-4 h-4" />
              Report a Scam
            </button>
          </div>

          <div className="my-6">
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
                    category === cat ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#475569] hover:text-[#2563EB]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {showForm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-12 px-4 pb-4">
              <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
              <div className="relative bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-700 text-lg text-[#0F172A]">Report a Scam</h2>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-[#F1F5F9]">
                    <X className="w-5 h-5 text-[#475569]" />
                  </button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">Type</label>
                    <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} className="input-field">
                      <option value="">Select type...</option>
                      {reportTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {errors.type && <p className="text-sm text-[#DC2626] mt-1">{errors.type}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">Target</label>
                    <input value={formData.target} onChange={e => setFormData(p => ({ ...p, target: e.target.value }))} className="input-field" placeholder="The URL, email, or phone number" />
                    {errors.target && <p className="text-sm text-[#DC2626] mt-1">{errors.target}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">Title</label>
                    <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="Brief title for this report" />
                    {errors.title && <p className="text-sm text-[#DC2626] mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">Category</label>
                    <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="input-field">
                      <option value="">Select category...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-sm text-[#DC2626] mt-1">{errors.category}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="input-field min-h-[100px]" placeholder="Describe what happened..." />
                    {errors.description && <p className="text-sm text-[#DC2626] mt-1">{errors.description}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">
                      Screenshots <span className="text-[#94A3B8] font-normal">(optional — max 5)</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-[#CBD5E1] rounded-xl p-4 text-center hover:border-[#2563EB] transition-colors cursor-pointer">
                      <Upload className="w-5 h-5 mx-auto text-[#475569]" />
                      <span className="text-sm text-[#475569] mt-1 block">Click to upload screenshots</span>
                    </button>
                    {uploadPreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {uploadPreviews.map((preview, i) => (
                          <div key={i} className="relative group">
                            <img src={preview} alt={`Screenshot ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-[#E2E8F0]" />
                            <button type="button" onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#DC2626] text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-start gap-2 mt-2 p-3 bg-[#F0FDF4] rounded-xl">
                      <ShieldCheck className="w-4 h-4 text-[#16A34A] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#166534]">
                        Your screenshots will <strong>only</strong> be used for verification by our moderation team. They will never be posted publicly or shared with third parties.
                      </p>
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Submit Report
                  </button>
                </form>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="grid gap-4 mt-8">
              {[1,2,3,4,5].map(i => <CardSkeleton key={i} />)}
            </div>
          )}

          <div className="space-y-4 mt-8">
            {data?.items?.map((report: any) => (
              <Card key={report._id}>
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#FEF2F2] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Flag className="w-5 h-5 text-[#DC2626]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#0F172A]">{report.title}</h3>
                    {report.target && (
                      <p className="text-xs font-mono text-[#475569] mt-1 truncate">{report.target}</p>
                    )}
                    <p className="text-sm text-[#475569] mt-1">{report.description.substring(0, 200)}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs font-mono bg-[#F1F5F9] px-2 py-1 rounded-lg">{report.type}</span>
                      <span className="text-xs text-[#475569]">{report.reports} reports</span>
                      {report.isVerified && <span className="text-xs text-[#16A34A]">Verified</span>}
                      {report.screenshots?.length > 0 && (
                        <span className="text-xs text-[#475569] flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {report.screenshots.length} screenshot{report.screenshots.length > 1 ? 's' : ''}
                        </span>
                      )}
                      <button
                        onClick={() => handleUpvote(report._id)}
                        className="flex items-center gap-1 text-xs font-medium text-[#475569] hover:text-[#2563EB] transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Upvote
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {data?.items?.length === 0 && (
              <Card><p className="text-[#475569] text-center py-8">No reports yet. Be the first to report!</p></Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
