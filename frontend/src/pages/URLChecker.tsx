import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';

interface BlacklistItem {
  name: string;
  listed: boolean;
  source: string;
}
interface RiskItem {
  category: string;
  severity: string;
  description: string;
}
interface SiteScrapeInfo {
  title: string;
  description: string;
  hasForms: boolean;
  hasPasswordField: boolean;
  hasPrivacyPolicy: boolean;
  hasContactPage: boolean;
  techStack: string[];
  contentLength: number;
  redirects: string[];
}
import SEOHead from '../components/SEOHead';
import SearchBar from '../components/SearchBar';
import RiskScore from '../components/RiskScore';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import ScanAnimation from '../components/ScanAnimation';
import ErrorBoundary from '../components/ErrorBoundary';
import ScoreBreakdown from '../components/ScoreBreakdown';
import { useScanUrl } from '../hooks/useScan';
import { ShieldAlert, RefreshCw, Flag } from 'lucide-react';


export default function URLChecker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { mutate: scan, data: report, isPending, isError } = useScanUrl();
  const queryParam = searchParams.get('q');

  useEffect(() => {
    if (queryParam) scan(queryParam);
  }, [queryParam, scan]);

  const handleSearch = (input: string) => {
    navigate(`/url-checker?q=${encodeURIComponent(input)}`);
  };

  return (
    <>
      <SEOHead
        title="URL Checker - Is This Website Safe?"
        description="Check if a website is safe or fraudulent. Free URL security analysis with detailed risk assessment, SSL check, domain age, and more."
      />

      <ErrorBoundary>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'URL Checker' }]} />

        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--bg-accent)] rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-[var(--text-accent)]" />
            </div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">URL Checker</h1>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">
            Check if a website is safe or potentially fraudulent. Our analysis checks SSL certificates,
            domain age, blacklists, and more.
          </p>
          <SearchBar
            placeholder="Enter a website URL (e.g., https://example.com)"
            onSubmit={handleSearch}
            isLoading={isPending}
          />
        </div>

        {(isPending || (queryParam && !report && !isError)) && (
          <div className="max-w-3xl mx-auto">
            <ScanAnimation type="url" />
          </div>
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
              <div className="flex-shrink-0">
                <RiskScore score={report.riskScore} size="lg" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-heading font-700 text-lg md:text-xl text-[var(--text-primary)] mb-2">Analysis Result</h2>
                <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">{report.summary}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Confidence: {report.confidenceScore}%</span>
                  <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Type: {report.type}</span>
                  <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Score: {report.riskScore}/100</span>
                </div>
              </div>
            </div>

            {report.scoreBreakdown && (
              <div className="mb-8">
                <ScoreBreakdown factors={report.scoreBreakdown} totalScore={report.riskScore} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {report.details?.ssl && (
                <Card>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">SSL Certificate</h3>
                  <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                    <p>Status: {report.details.ssl.valid ? 'Valid' : 'Invalid'}</p>
                    <p>Issuer: {report.details.ssl.issuer}</p>
                    <p>Days remaining: {report.details.ssl.daysRemaining}</p>
                  </div>
                </Card>
              )}

              {report.details?.domainAge && (
                <Card>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">Domain Age</h3>
                  <div className="space-y-1 text-sm text-[var(--text-secondary)]">
                    <p>Created: {new Date(report.details.domainAge.created).toLocaleDateString()}</p>
                    <p>Age: {report.details.domainAge.daysSinceCreation} days</p>
                    <p>Months: {report.details.domainAge.monthsSinceCreation}</p>
                  </div>
                </Card>
              )}

              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Blacklist Status</h3>
                <div className="space-y-2">
                  {(report.details?.blacklists as BlacklistItem[] | undefined)?.map((b: BlacklistItem) => (
                    <div key={b.name} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-secondary)]">{b.name}</span>
                      <span className={b.listed ? 'text-[#DC2626]' : 'text-[#16A34A]'}>
                        {b.listed ? 'Listed' : 'Clear'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Detected Risks</h3>
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
                  <p className="text-sm text-[#16A34A]">No risks detected</p>
                )}
              </Card>
            </div>

            {(report.details?.siteScrape as SiteScrapeInfo | null) && (
              <Card className="mb-8">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Site Content</h3>
                <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                  {(report.details.siteScrape as SiteScrapeInfo).title && (
                    <p><span className="font-medium text-[var(--text-primary)]">Title:</span> {(report.details.siteScrape as SiteScrapeInfo).title}</p>
                  )}
                  {(report.details.siteScrape as SiteScrapeInfo).description && (
                    <p><span className="font-medium text-[var(--text-primary)]">Description:</span> {(report.details.siteScrape as SiteScrapeInfo).description}</p>
                  )}
                  {(report.details.siteScrape as SiteScrapeInfo).techStack.length > 0 && (
                    <p><span className="font-medium text-[var(--text-primary)]">Tech Stack:</span> {(report.details.siteScrape as SiteScrapeInfo).techStack.join(', ')}</p>
                  )}
                  <p><span className="font-medium text-[var(--text-primary)]">Content Length:</span> {(report.details.siteScrape as SiteScrapeInfo).contentLength.toLocaleString()} characters</p>
                  <p><span className="font-medium text-[var(--text-primary)]">Has Privacy Policy:</span> {(report.details.siteScrape as SiteScrapeInfo).hasPrivacyPolicy ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium text-[var(--text-primary)]">Has Contact Page:</span> {(report.details.siteScrape as SiteScrapeInfo).hasContactPage ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium text-[var(--text-primary)]">Has Forms:</span> {(report.details.siteScrape as SiteScrapeInfo).hasForms ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium text-[var(--text-primary)]">Has Password Field:</span> {(report.details.siteScrape as SiteScrapeInfo).hasPasswordField ? 'Yes' : 'No'}</p>
                  {(report.details.siteScrape as SiteScrapeInfo).redirects.length > 1 && (
                    <p><span className="font-medium text-[var(--text-primary)]">Redirects:</span> {(report.details.siteScrape as SiteScrapeInfo).redirects.join(' → ')}</p>
                  )}
                </div>
              </Card>
            )}

            <Card className="mb-8">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {report.recommendations?.map((rec: string, i: number) => (
                  <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="text-[var(--text-accent)] mt-0.5">&#8226;</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </Card>

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
                    onClick={() => navigate(`/community-reports?type=url&target=${encodeURIComponent(queryParam || '')}`)}
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'URL Checker - Free Phishing & Malware Scanner',
          description: 'Check if a website is safe or fraudulent. Free URL security analysis with SSL check, domain age, blacklist status, and AI-powered threat detection.',
          url: 'https://trustlens.app/url-checker',
          applicationCategory: 'SecurityApplication',
          operatingSystem: 'All',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }),
      }} />
      </ErrorBoundary>
    </>
  );
}
