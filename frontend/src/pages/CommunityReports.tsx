import { useQuery } from '@tanstack/react-query';
import { getCommunityReports } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import { CardSkeleton } from '../components/Skeleton';
import { AlertTriangle, MessageSquare, Globe, Phone } from 'lucide-react';

export default function CommunityReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['community-reports'],
    queryFn: () => getCommunityReports({ page: 1 }),
  });

  return (
    <>
      <SEOHead title="Community Reports - See What Others Are Reporting" description="Browse community-submitted reports of suspicious websites, emails, phone numbers, and scams." canonical="https://trustlens.app/community-reports" />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Community Reports' }]} />
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading font-700 text-2xl md:text-3xl text-[#0F172A] mb-2">Community Reports</h1>
          <p className="text-[#475569] mb-8">Browse reports submitted by the community about suspicious websites, emails, phone numbers, and more.</p>

          {isLoading && (
            <div className="grid gap-4">
              {[1,2,3,4,5].map(i => <CardSkeleton key={i} />)}
            </div>
          )}

          <div className="space-y-4">
            {data?.items?.map((report: any) => (
              <Card key={report._id}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#FEF2F2] rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0F172A]">{report.title}</h3>
                    <p className="text-sm text-[#475569] mt-1">{report.description.substring(0, 200)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-mono bg-[#F1F5F9] px-2 py-1 rounded-lg">{report.type}</span>
                      <span className="text-xs text-[#475569]">{report.reports} reports</span>
                      {report.isVerified && <span className="text-xs text-[#16A34A]">Verified</span>}
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
