import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import SearchBar from '../components/SearchBar';
import RiskScore from '../components/RiskScore';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import { ReportSkeleton } from '../components/Skeleton';
import { useScanEmail } from '../hooks/useScan';

export default function EmailChecker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mutation = useScanEmail();
  const queryParam = searchParams.get('q');
  const report = mutation.data;

  useEffect(() => {
    if (queryParam) mutation.mutate(queryParam);
  }, [queryParam, mutation]);

  const handleSearch = (input: string) => {
    navigate(`/email-checker?q=${encodeURIComponent(input)}`);
  };

  return (
    <>
      <SEOHead
        title="Email Checker - Is This Email a Scam?"
        description="Analyze email addresses for phishing and scam indicators. Free email security analysis with AI-powered detection."
      />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Email Checker' }]} />
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#F0FDF4] rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#16A34A]" />
            </div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">Email Checker</h1>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">
            Check if an email address or email message is part of a phishing attempt or scam campaign.
          </p>
          <SearchBar placeholder="Enter an email address or email content..." onSubmit={handleSearch} isLoading={mutation.isPending} />
        </div>

        {mutation.isPending && (
          <div className="max-w-3xl mx-auto"><ReportSkeleton /></div>
        )}

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
                <h2 className="font-heading font-700 text-xl text-[var(--text-primary)] mb-2">Email Analysis Result</h2>
                <p className="text-[var(--text-secondary)] mb-4">{report.summary}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Confidence: {report.confidenceScore}%</span>
                  <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Input: {(report.input || '').substring(0, 50)}</span>
                </div>
              </div>
            </div>

            <Card className="mb-8">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Detected Risk Indicators</h3>
              {report.details?.detectedRisks?.length > 0 ? (
                <ul className="space-y-2">
                  {report.details.detectedRisks.map((risk: Record<string, unknown>, i: number) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        risk.severity === 'critical' ? 'bg-[#991B1B]' :
                        risk.severity === 'high' ? 'bg-[#DC2626]' :
                        risk.severity === 'medium' ? 'bg-[#D97706]' : 'bg-[#16A34A]'
                      }`} />
                      {risk.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#16A34A]">No risk indicators detected</p>
              )}
            </Card>

            {report.details?.aiAnalysis && (
              <Card className="mb-8">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">AI Analysis</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-3">{report.details.aiAnalysis.summary}</p>
                {report.details.aiAnalysis.riskFactors?.length > 0 && (
                  <ul className="space-y-1">
                    {report.details.aiAnalysis.riskFactors.map((f: string, i: number) => (
                      <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-[#D97706]">&#9888;</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}
