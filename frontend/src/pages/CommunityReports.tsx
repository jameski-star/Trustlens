import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getCommunityReports, createCommunityReport, upvoteCommunityReport, downvoteCommunityReport } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import { CardSkeleton } from '../components/Skeleton';
import { Flag, Plus, X, Loader2, ThumbsUp, ThumbsDown, Image as ImageIcon, Upload, ShieldCheck, Eye, EyeOff, Shield, Clock, ChevronDown, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { SITE_URL } from '../config';
import { useAuth } from '../hooks/useAuth';
import { formatText, wordSafeTruncate } from '../utils/textFormatter';

const reportTypes = [
  { value: 'url', label: 'URL / Website' },
  { value: 'email', label: 'Email Address' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'whatsapp', label: 'WhatsApp Number' },
  { value: 'crypto', label: 'Crypto / Investment' },
  { value: 'investment', label: 'Investment Platform' },
];

interface ScanResult {
  riskScore: number;
  riskLevel: string;
  summary: string;
}
interface CommunityReportItem {
  _id: string;
  title: string;
  target: string;
  description: string;
  type: string;
  upvotes: number;
  downvotes: number;
  reports: number;
  isVerified: boolean;
  screenshots: string[];
  category: string;
  status: string;
  createdAt: string;
  scanStatus?: 'pending' | 'scanning' | 'completed' | 'failed';
  scanResult?: ScanResult;
}

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

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/v1\/?$/, '') || '';

export default function CommunityReports() {
  const [searchParams] = useSearchParams();
  const prefillType = searchParams.get('type') || '';
  const prefillTarget = searchParams.get('target') || '';
  const hasPrefill = Boolean(prefillType || prefillTarget);

  const urlCleaned = useRef(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [visibleScreenshots, setVisibleScreenshots] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(hasPrefill);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [category, setCategory] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (hasPrefill && !urlCleaned.current) {
      urlCleaned.current = true;
      window.history.replaceState({}, '', '/community-reports');
    }
  }, [hasPrefill]);

  const { data, isLoading } = useQuery({
    queryKey: ['community-reports', category],
    queryFn: () => getCommunityReports({ page: 1, category: category === 'All' ? undefined : category }),
    staleTime: 120_000,
  });

  const handleVote = async (id: string, type: 'upvote' | 'downvote') => {
    try {
      if (type === 'upvote') await upvoteCommunityReport(id);
      else await downvoteCommunityReport(id);
      queryClient.invalidateQueries({ queryKey: ['community-reports'] });
      queryClient.invalidateQueries({ queryKey: ['scam-alerts'] });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: { error?: string } } };
        if (axiosErr.response?.status === 409) {
          toast.error(axiosErr.response?.data?.error || 'You have already voted this way');
          return;
        }
      }
      toast.error('Failed to vote');
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
    type: prefillType,
    target: prefillTarget,
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
    } catch {
      toast.error('Failed to submit report');
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
              <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">Community Reports</h1>
              <p className="text-[var(--text-secondary)] mt-1">Browse reports submitted by the community about suspicious websites, emails, phone numbers, and more.</p>
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
                    category === cat ? 'bg-[#2563EB] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-accent)]'
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
              <div className="relative bg-[var(--bg-surface)] rounded-2xl shadow-xl border border-[var(--border)] p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-700 text-lg text-[var(--text-primary)]">Report a Scam</h2>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-[var(--bg-subtle)]">
                    <X className="w-5 h-5 text-[var(--text-secondary)]" />
                  </button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Type</label>
                    <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))} className="input-field">
                      <option value="">Select type...</option>
                      {reportTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {errors.type && <p className="text-sm text-[#DC2626] mt-1">{errors.type}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Target</label>
                    <input value={formData.target} onChange={e => setFormData(p => ({ ...p, target: e.target.value }))} className="input-field" placeholder="The URL, email, or phone number" />
                    {errors.target && <p className="text-sm text-[#DC2626] mt-1">{errors.target}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Title</label>
                    <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="Brief title for this report" />
                    {errors.title && <p className="text-sm text-[#DC2626] mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Category</label>
                    <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="input-field">
                      <option value="">Select category...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-sm text-[#DC2626] mt-1">{errors.category}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="input-field min-h-[100px]" placeholder="Describe what happened..." />
                    {errors.description && <p className="text-sm text-[#DC2626] mt-1">{errors.description}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
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
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-[#CBD5E1] rounded-xl p-4 text-center hover:border-[var(--border-accent)] transition-colors cursor-pointer">
                      <Upload className="w-5 h-5 mx-auto text-[var(--text-secondary)]" />
                      <span className="text-sm text-[var(--text-secondary)] mt-1 block">Click to upload screenshots</span>
                    </button>
                    {uploadPreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {uploadPreviews.map((preview, i) => (
                          <div key={i} className="relative group">
                            <img src={preview} alt={`Screenshot ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-[var(--border)]" />
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

          <div className="space-y-3 mt-8">
            {data?.items?.map((item: CommunityReportItem) => (
              <details key={item._id} className="group">
                <summary className="cursor-pointer list-none">
                  <div className="card hover:shadow-card-hover transition-all duration-200 group-open:ring-2 group-open:ring-[#2563EB]/20 group-open:shadow-md">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        item.status === 'scam_alert' ? 'bg-[#FEF2F2]' :
                        item.status === 'published' ? 'bg-[#F0FDF4]' :
                        'bg-[#FFFBEB]'
                      }`}>
                        <Flag className={`w-5 h-5 ${
                          item.status === 'scam_alert' ? 'text-[#DC2626]' :
                          item.status === 'published' ? 'text-[#16A34A]' :
                          'text-[#D97706]'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-[var(--text-primary)] leading-snug">{item.title}</h3>
                          <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] shrink-0 mt-1 transition-transform duration-200 group-open:rotate-180" />
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-secondary)]">{item.type}</span>
                          {item.target && (
                            <span className="text-xs font-mono text-[var(--text-secondary)] max-w-[200px] truncate" title={item.target}>{item.target}</span>
                          )}
                          <span className="text-xs text-[var(--text-secondary)]">&middot;</span>
                          <span className="text-xs text-[var(--text-secondary)]">{item.reports} reports</span>
                          {item.isVerified && (
                            <>
                              <span className="text-xs text-[var(--text-secondary)]">&middot;</span>
                              <span className="text-xs font-medium text-[#16A34A]">Verified</span>
                            </>
                          )}
                        </div>
                        <div
                          className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: item.description.length > 200
                            ? wordSafeTruncate(formatText(item.description), 200)
                            : formatText(item.description)
                          }}
                        />
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {item.status === 'scam_alert' && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626]">Scam Alert</span>
                          )}
                          {item.status === 'published' && (
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A]">Published</span>
                          )}
                          {item.status === 'rejected' && (
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#94A3B8]">Rejected</span>
                          )}
                          {item.status === 'pending' && (
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D97706]">Pending</span>
                          )}
                          {item.screenshots?.length > 0 && (
                            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {item.screenshots.length}
                            </span>
                          )}
                          {item.scanStatus === 'completed' && item.scanResult && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                              item.scanResult.riskLevel === 'safe' || item.scanResult.riskLevel === 'low'
                                ? 'bg-[#F0FDF4] text-[#16A34A]'
                                : 'bg-[#FEF2F2] text-[#DC2626]'
                            }`}>
                              <Shield className="w-3 h-3" />
                              {item.scanResult.riskScore}/100
                            </span>
                          )}
                          {item.scanStatus === 'scanning' && (
                            <span className="text-xs text-[#D97706] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Scanning
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </summary>
                <div className="card mt-1 rounded-t-none border-t-0 shadow-sm overflow-hidden">
                  {item.description.length > 200 && (
                    <div className="text-sm text-[var(--text-primary)] leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: formatText(item.description) }} />
                  )}
                  {item.screenshots && item.screenshots.length > 0 && (
                    <div className="mb-4">
                      {isAdmin || visibleScreenshots.has(item._id) ? (
                        <div className="flex flex-wrap gap-2">
                          {item.screenshots.map((src, i) => (
                            <img key={i} src={src.startsWith('http') ? src : `${API_BASE}${src}`} alt={`Evidence ${i + 1}`} className="w-36 h-28 sm:w-44 sm:h-32 object-cover rounded-xl border border-[var(--border)]" loading="lazy" />
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-[#FFFBEB] rounded-xl border border-[#FDE68A]/50">
                          <EyeOff className="w-4 h-4 text-[#D97706] shrink-0" />
                          <p className="text-xs text-[#92400E] flex-1">Screenshots visible to moderators only.</p>
                          <button
                            onClick={() => setVisibleScreenshots(prev => new Set(prev).add(item._id))}
                            className="text-xs font-medium text-[#2563EB] hover:underline shrink-0 flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Show
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--text-secondary)]">{new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    {item.target && (
                      <a href={item.target.startsWith('http') ? item.target : `https://${item.target}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--text-accent)] hover:underline flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <ExternalLink className="w-3 h-3" />
                        Visit
                      </a>
                    )}
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(item._id, 'upvote'); }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-[var(--text-secondary)] hover:text-[#16A34A] hover:bg-[#F0FDF4] transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{item.upvotes || 0}</span>
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVote(item._id, 'downvote'); }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-[var(--text-secondary)] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{item.downvotes || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </details>
            ))}
            {data?.items?.length === 0 && (
              <Card><p className="text-[var(--text-secondary)] text-center py-8">No reports yet. Be the first to report!</p></Card>
            )}
          </div>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DataCatalog',
            name: 'Community Reports - TrustLens',
            description: 'Browse community-submitted reports about scam websites, phishing emails, fake phone numbers, and fraudulent investment platforms.',
            url: `${SITE_URL}/community-reports`,
          }),
        }} />
      </div>
    </>
  );
}
