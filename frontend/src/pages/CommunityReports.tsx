import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCommunityReports, createCommunityReport, upvoteCommunityReport } from '../api/client';
import { communityReportSchema, CommunityReportInput } from '../validation/schemas';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import { CardSkeleton } from '../components/Skeleton';
import { Flag, Plus, X, Loader2, ThumbsUp } from 'lucide-react';
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
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['community-reports'],
    queryFn: () => getCommunityReports({ page: 1 }),
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

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CommunityReportInput>({
    resolver: zodResolver(communityReportSchema),
  });

  const onSubmit = async (formData: CommunityReportInput) => {
    try {
      await createCommunityReport(formData);
      toast.success('Report submitted for review. Thank you!');
      reset();
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['community-reports'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit report');
    }
  };

  return (
    <>
      <SEOHead title="Community Reports - See What Others Are Reporting" description="Browse community-submitted reports of suspicious websites, emails, phone numbers, and scams." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Community Reports' }]} />
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h1 className="font-heading font-700 text-2xl md:text-3xl text-[#0F172A]">Community Reports</h1>
              <p className="text-[#475569] mt-1">Browse reports submitted by the community about suspicious websites, emails, phone numbers, and more.</p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm whitespace-nowrap shrink-0">
              <Plus className="w-4 h-4" />
              Report a Scam
            </button>
          </div>

          {showForm && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-12 px-4 pb-4">
              <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
              <div className="relative bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-700 text-lg text-[#0F172A]">Report a Scam</h2>
                  <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-[#F1F5F9]">
                    <X className="w-5 h-5 text-[#475569]" />
                  </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">Type</label>
                    <select {...register('type')} className="input-field">
                      <option value="">Select type...</option>
                      {reportTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {errors.type && <p className="text-sm text-[#DC2626] mt-1">{errors.type.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">Target</label>
                    <input {...register('target')} className="input-field" placeholder="The URL, email, or phone number" />
                    {errors.target && <p className="text-sm text-[#DC2626] mt-1">{errors.target.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">Title</label>
                    <input {...register('title')} className="input-field" placeholder="Brief title for this report" />
                    {errors.title && <p className="text-sm text-[#DC2626] mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">Category</label>
                    <select {...register('category')} className="input-field">
                      <option value="">Select category...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-sm text-[#DC2626] mt-1">{errors.category.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1">Description</label>
                    <textarea {...register('description')} className="input-field min-h-[100px]" placeholder="Describe what happened..." />
                    {errors.description && <p className="text-sm text-[#DC2626] mt-1">{errors.description.message}</p>}
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
