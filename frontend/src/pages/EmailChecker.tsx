import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Info, ShieldAlert, RefreshCw, Flag } from 'lucide-react';

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
import ScoreBreakdown from '../components/ScoreBreakdown';
import { useScanEmail } from '../hooks/useScan';

export default function EmailChecker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutate: scan, data: report, isPending, isError } = useScanEmail();
  const queryParam = searchParams.get('q');

  useEffect(() => {
    if (queryParam) scan(queryParam);
  }, [queryParam, scan]);

  const handleSearch = (input: string) => {
    navigate(`/email-checker?q=${encodeURIComponent(input)}`);
  };

  return (
    <>
      <SEOHead
        title="Email Checker"
        description="Analyze an email address or message for phishing and scam indicators."
      />
      <ErrorBoundary>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Email Checker' }]} />
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--bg-accent)] rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-[var(--text-accent)]" />
            </div>
            <div>
              <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">Email Checker</h1>
              <p className="text-xs text-[var(--text-secondary)] hidden sm:block">Analyze emails for phishing and scam indicators</p>
            </div>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">
            Check if an email address or message is associated with phishing or scam campaigns.
          </p>
          <SearchBar placeholder="Enter an email address or message..." onSubmit={handleSearch} isLoading={isPending} />
          <div className="flex items-center gap-1.5 mt-3 text-xs text-[var(--text-secondary)]">
            <Info className="w-3.5 h-3.5" />
            <span>Queries are not stored or shared.</span>
          </div>
        </div>

        {isPending && (
          <div className="max-w-3xl mx-auto"><ScanAnimation type="email" /></div>
        )}

        {isError && (
          <div className="max-w-3xl mx-auto">
            <Card className="text-center py-10">
              <div className="w-12 h-12 mx-auto mb-4 bg-[var(--bg-subtle)] rounded-xl flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-[var(--text-secondary)]" />
              </div>
              <h3 className="font-heading font-600 text-lg text-[var(--text-primary)] mb-1">Analysis unavailable</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">The service is temporarily unavailable. Please try again.</p>
              <button onClick={() => scan(queryParam!)} className="btn-primary">
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </Card>
          </div>
        )}

        {report && (
          <div className="max-w-4xl mx-auto break-words">
            <div className="flex flex-col lg:flex-row items-start gap-6 md:gap-8 mb-6 md:mb-8">
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <RiskScore score={report.riskScore} size="lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-heading font-700 text-lg md:text-xl text-[var(--text-primary)]">Analysis result</h2>
                  <span className="text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-lg">
                    {report.riskScore >= 60 ? 'Low risk' : report.riskScore >= 40 ? 'Medium risk' : 'High risk'}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">{report.summary}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Confidence: {report.confidenceScore}%</span>
                  <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Input: {(report.input || '').substring(0, 50)}</span>
                </div>
              </div>
            </div>

            {report.scoreBreakdown && (
              <div className="mb-8">
                <ScoreBreakdown factors={report.scoreBreakdown} totalScore={report.riskScore} />
              </div>
            )}

            <Card className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-heading font-600 text-[var(--text-primary)]">Detected indicators</h3>
              </div>
              {report.details?.detectedRisks?.length > 0 ? (
                <ul className="space-y-2">
                  {report.details.detectedRisks.map((risk: RiskItem, i: number) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-[var(--text-accent)]" />
                      <span className="leading-relaxed">{risk.description}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">None detected</p>
              )}
            </Card>

            {report.details?.aiAnalysis && (
              <Card className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-heading font-600 text-[var(--text-primary)]">Pattern detection</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">{report.details.aiAnalysis.summary}</p>
                {report.details.aiAnalysis.riskFactors?.length > 0 && (
                  <ul className="space-y-2">
                    {report.details.aiAnalysis.riskFactors.map((f: string, i: number) => (
                      <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-[var(--text-accent)] leading-none mt-0.5">&#8226;</span>
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

            <Card className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-heading font-600 text-[var(--text-primary)]">Recommendations</h3>
              </div>
              <ul className="space-y-2">
                {report.recommendations?.map((rec: string, i: number) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2.5">
                    <span className="text-[var(--text-accent)] mt-0.5 text-lg leading-none">&rsaquo;</span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {report.riskScore < 40 && (
              <Card className="mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--bg-subtle)] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Flag className="w-5 h-5 text-[var(--text-secondary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-600 text-[var(--text-primary)]">Report this to the community</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">Help others stay safe by sharing this threat</p>
                  </div>
                  <button
                    onClick={() => navigate(`/community-reports?type=email&target=${encodeURIComponent(queryParam || '')}`)}
                    className="btn-primary text-sm w-full md:w-auto min-h-[44px]"
                  >
                    <Flag className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">Report</span>
                  </button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
      </ErrorBoundary>
    </>
  );
}
