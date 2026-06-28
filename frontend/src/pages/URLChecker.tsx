import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Globe, Loader2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import SearchBar from '../components/SearchBar';
import RiskScore from '../components/RiskScore';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import { ReportSkeleton } from '../components/Skeleton';
import { useScanUrl } from '../hooks/useScan';

export default function URLChecker() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mutation = useScanUrl();
  const queryParam = searchParams.get('q');
  const report = mutation.data;

  useEffect(() => {
    if (queryParam) {
      mutation.mutate(queryParam);
    }
  }, [queryParam]);

  const handleSearch = (input: string) => {
    navigate(`/url-checker?q=${encodeURIComponent(input)}`);
  };

  return (
    <>
      <SEOHead
        title="URL Checker - Is This Website Safe?"
        description="Check if a website is safe or fraudulent. Free URL security analysis with detailed risk assessment, SSL check, domain age, and more."
      />

      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'URL Checker' }]} />

        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#2563EB]" />
            </div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[#0F172A]">URL Checker</h1>
          </div>
          <p className="text-[#475569] mb-6">
            Check if a website is safe or potentially fraudulent. Our analysis checks SSL certificates,
            domain age, blacklists, and more.
          </p>
          <SearchBar
            placeholder="Enter a website URL (e.g., https://example.com)"
            onSubmit={handleSearch}
            isLoading={mutation.isPending}
          />
        </div>

        {mutation.isPending && (
          <div className="max-w-3xl mx-auto">
            <ReportSkeleton />
          </div>
        )}

        {mutation.isError && (
          <div className="max-w-3xl mx-auto">
            <Card>
              <p className="text-[#DC2626]">Analysis failed. Please try again.</p>
            </Card>
          </div>
        )}

        {report && (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
              <div className="flex-shrink-0">
                <RiskScore score={report.riskScore} size="lg" />
              </div>
              <div className="flex-1">
                <h2 className="font-heading font-700 text-xl text-[#0F172A] mb-2">Analysis Result</h2>
                <p className="text-[#475569] mb-4">{report.summary}</p>
                <div className="flex flex-wrap gap-3">
                  <span className="text-xs font-mono text-[#475569] bg-[#F1F5F9] px-3 py-1.5 rounded-lg">Confidence: {report.confidenceScore}%</span>
                  <span className="text-xs font-mono text-[#475569] bg-[#F1F5F9] px-3 py-1.5 rounded-lg">Type: {report.type}</span>
                  <span className="text-xs font-mono text-[#475569] bg-[#F1F5F9] px-3 py-1.5 rounded-lg">Score: {report.riskScore}/100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {report.details?.ssl && (
                <Card>
                  <h3 className="font-semibold text-[#0F172A] mb-2">SSL Certificate</h3>
                  <div className="space-y-1 text-sm text-[#475569]">
                    <p>Status: {report.details.ssl.valid ? 'Valid' : 'Invalid'}</p>
                    <p>Issuer: {report.details.ssl.issuer}</p>
                    <p>Days remaining: {report.details.ssl.daysRemaining}</p>
                  </div>
                </Card>
              )}

              {report.details?.domainAge && (
                <Card>
                  <h3 className="font-semibold text-[#0F172A] mb-2">Domain Age</h3>
                  <div className="space-y-1 text-sm text-[#475569]">
                    <p>Created: {new Date(report.details.domainAge.created).toLocaleDateString()}</p>
                    <p>Age: {report.details.domainAge.daysSinceCreation} days</p>
                    <p>Months: {report.details.domainAge.monthsSinceCreation}</p>
                  </div>
                </Card>
              )}

              <Card>
                <h3 className="font-semibold text-[#0F172A] mb-2">Blacklist Status</h3>
                <div className="space-y-2">
                  {report.details?.blacklists?.map((b: any) => (
                    <div key={b.name} className="flex items-center justify-between text-sm">
                      <span className="text-[#475569]">{b.name}</span>
                      <span className={b.listed ? 'text-[#DC2626]' : 'text-[#16A34A]'}>
                        {b.listed ? 'Listed' : 'Clear'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-[#0F172A] mb-2">Detected Risks</h3>
                {report.details?.detectedRisks?.length > 0 ? (
                  <ul className="space-y-2">
                    {report.details.detectedRisks.map((risk: any, i: number) => (
                      <li key={i} className="text-sm text-[#475569] flex items-start gap-2">
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

            <Card className="mb-8">
              <h3 className="font-semibold text-[#0F172A] mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {report.recommendations?.map((rec: string, i: number) => (
                  <li key={i} className="text-sm text-[#475569] flex items-start gap-2">
                    <span className="text-[#2563EB] mt-0.5">&#8226;</span>
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
