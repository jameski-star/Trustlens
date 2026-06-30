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
import ScanAnimation from '../components/ScanAnimation';
import ErrorBoundary from '../components/ErrorBoundary';
import { useScanSms } from '../hooks/useScan';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function SMSChecker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutate: scan, data: report, isPending, isError } = useScanSms();
  const queryParam = searchParams.get('q');

  useEffect(() => {
    if (queryParam) scan(queryParam);
  }, [queryParam]);

  const handleSearch = (input: string) => {
    navigate(`/sms-checker?q=${encodeURIComponent(input)}`);
  };

  return (
    <>
      <SEOHead
        title="SMS Checker - Is This Text a Scam?"
        description="Check if an SMS message or phone number is associated with known scams. Free SMS security analysis."
      />
      <ErrorBoundary>
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
          <SearchBar placeholder="Enter a phone number or SMS message text..." onSubmit={handleSearch} isLoading={isPending} />
        </div>

        {isPending && <div className="max-w-3xl mx-auto"><ScanAnimation type="sms" /></div>}

        {isError && (
          <div className="max-w-3xl mx-auto">
            <Card className="text-center py-10">
              <div className="w-12 h-12 mx-auto mb-4 bg-[#FEF2F2] rounded-2xl flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-[#DC2626]" />
              </div>
              <h3 className="font-heading font-600 text-lg text-[var(--text-primary)] mb-1">Analysis failed</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">Unable to complete the scan. The service may be temporarily unavailable.</p>
              <button onClick={() => scan(queryParam!)} className="btn-primary gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry Scan
              </button>
            </Card>
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
      </ErrorBoundary>
    </>
  );
}
