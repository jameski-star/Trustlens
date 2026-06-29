import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

interface RiskItem {
  category: string;
  severity: string;
  description: string;
}
import SEOHead from '../components/SEOHead';
import SearchBar from '../components/SearchBar';
import RiskScore from '../components/RiskScore';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import { ReportSkeleton } from '../components/Skeleton';
import { useScanSms } from '../hooks/useScan';

export default function SMSChecker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mutation = useScanSms();
  const queryParam = searchParams.get('q');
  const report = mutation.data;

  useEffect(() => {
    if (queryParam) mutation.mutate(queryParam);
  }, [queryParam, mutation]);

  const handleSearch = (input: string) => {
    navigate(`/sms-checker?q=${encodeURIComponent(input)}`);
  };

  return (
    <>
      <SEOHead
        title="SMS Checker - Is This Text a Scam?"
        description="Check if an SMS message or phone number is associated with known scams. Free SMS security analysis."
      />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'SMS Checker' }]} />
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FFFBEB] rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#D97706]" />
            </div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">SMS & Phone Checker</h1>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">
            Check if an SMS message, phone number, or WhatsApp message is part of a scam campaign.
          </p>
          <SearchBar placeholder="Enter a phone number or SMS message text..." onSubmit={handleSearch} isLoading={mutation.isPending} />
        </div>

        {mutation.isPending && <div className="max-w-3xl mx-auto"><ReportSkeleton /></div>}

        {mutation.isError && (
          <div className="max-w-3xl mx-auto">
            <Card><p className="text-[#DC2626]">Analysis failed. Please try again.</p></Card>
          </div>
        )}

        {report && (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
              <RiskScore score={report.riskScore} size="lg" />
              <div className="flex-1">
                <h2 className="font-heading font-700 text-xl text-[var(--text-primary)] mb-2">SMS Analysis Result</h2>
                <p className="text-[var(--text-secondary)] mb-4">{report.summary}</p>
              </div>
            </div>

            <Card className="mb-8">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Detected Risks</h3>
              {report.details?.detectedRisks?.length > 0 ? (
                <ul className="space-y-2">
                  {(report.details?.detectedRisks as RiskItem[] | undefined)?.map((risk: RiskItem, i: number) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-[#D97706]">&#8226;</span>
                      {risk.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#16A34A]">No risks detected</p>
              )}
            </Card>

            <Card className="mb-8">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {report.recommendations?.map((rec: string, i: number) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="text-[var(--text-accent)]">&#8226;</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
