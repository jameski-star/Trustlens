import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';

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
import { ShieldAlert, RefreshCw, Flag } from 'lucide-react';

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
        title="Email Checker - Is This Email a Scam?"
        description="Analyze email addresses for phishing and scam indicators. Free email security analysis with AI-powered detection."
      />
      <ErrorBoundary>
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
          <SearchBar placeholder="Enter an email address or email content..." onSubmit={handleSearch} isLoading={isPending} />
          <div className="flex items-start gap-2 mt-4 p-3 bg-[#F0FDF4] rounded-xl">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] mt-0.5 shrink-0" />
            <p className="text-xs text-[#166534] leading-relaxed">
              <strong>Privacy first.</strong> Email addresses are checked against known phishing databases in real-time. We do not store, log, or share your queries.
            </p>
          </div>
        </div>

        {isPending && (
          <div className="max-w-3xl mx-auto"><ScanAnimation type="email" /></div>
        )}

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
          <div className="max-w-4xl mx-auto break-words">
            <div className="flex flex-col lg:flex-row items-start gap-6 md:gap-8 mb-6 md:mb-8">
              <RiskScore score={report.riskScore} size="lg" />
              <div className="flex-1 min-w-0">
                <h2 className="font-heading font-700 text-lg md:text-xl text-[var(--text-primary)] mb-2">Email Analysis Result</h2>
                <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">{report.summary}</p>
                <div className="flex flex-wrap gap-3">
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
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Detected Risk Indicators</h3>
              {report.details?.detectedRisks?.length > 0 ? (
                <ul className="space-y-2">
                  {report.details.detectedRisks.map((risk: RiskItem, i: number) => (
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

            {report.riskScore < 40 && (
              <Card className="mb-8 border-[#DC2626]/20">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-10 h-10 bg-[#FEF2F2] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Flag className="w-5 h-5 text-[#DC2626]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)]">Report this to the community</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">Help others stay safe by sharing this threat</p>
                  </div>
                  <button
                    onClick={() => navigate(`/community-reports?type=email&target=${encodeURIComponent(queryParam || '')}`)}
                    className="btn-primary text-sm w-full md:w-auto min-h-[44px]"
                  >
                    <Flag className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">Report to Community</span>
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
