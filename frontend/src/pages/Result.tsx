import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getReport } from '../api/client';

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
import SEOHead from '../components/SEOHead';
import RiskScore from '../components/RiskScore';
import ScoreBreakdown from '../components/ScoreBreakdown';
import Card from '../components/Card';
import { ReportSkeleton } from '../components/Skeleton';
import ErrorBoundary from '../components/ErrorBoundary';
import Breadcrumbs from '../components/Breadcrumbs';
import { Download, ShieldAlert, RefreshCw, ExternalLink } from 'lucide-react';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';

export default function Result() {
  const { shareId } = useParams<{ shareId: string }>();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', shareId],
    queryFn: () => getReport(shareId!),
    enabled: !!shareId,
    staleTime: 60_000,
    gcTime: 300_000,
  });

  const handleDownloadPdf = async () => {
    try {
      const response = await apiClient.get(`/scan/report/${shareId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trustlens-report-${shareId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <>
      <SEOHead
        title={report?.input ? `Analysis Report: ${report.input.substring(0, 50)}` : 'Security Analysis Report'}
        description="Detailed security analysis report with risk score, SSL check, domain information, and recommendations."
      />
      <ErrorBoundary>
      <div className="container-page py-6 md:py-8">
        <Breadcrumbs items={[
          { label: 'Analysis Report', href: '#' },
          { label: shareId || '' },
        ]} />

        {isLoading && (
          <div className="max-w-3xl mx-auto mt-8">
            <ReportSkeleton />
          </div>
        )}
        {error && (
          <div className="max-w-3xl mx-auto">
            <Card className="text-center py-10">
              <div className="w-12 h-12 mx-auto mb-4 bg-[var(--trust-danger-bg)] rounded-2xl flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-[var(--trust-danger)]" />
              </div>
              <h3 className="font-heading font-600 text-lg text-[var(--text-primary)] mb-1">Report not found</h3>
              <p className="text-[var(--text-secondary)] text-sm mb-4">This report may have expired or the link is invalid.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => window.location.reload()} className="btn-primary gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <Link to="/" className="btn-secondary gap-2">
                  <ExternalLink className="w-4 h-4" />
                  New Scan
                </Link>
              </div>
            </Card>
          </div>
        )}

         {report && (
           <div className="mx-auto max-w-5xl">
             <div className="report-header">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <h1 className="font-heading font-700 text-xl md:text-2xl text-[var(--text-primary)]">Security Analysis Report</h1>
                 </div>
                 <p className="text-sm text-[var(--text-secondary)]">
                   Analyzed: {report.input || 'N/A'} &middot; {new Date(report.createdAt).toLocaleString()}
                 </p>
               </div>
               <button onClick={handleDownloadPdf} className="btn-secondary text-sm whitespace-nowrap">
                 <Download className="w-4 h-4" />
                 Download PDF
               </button>
             </div>

             <div className="flex flex-col lg:flex-row items-start gap-6 md:gap-8 mb-8">
               <div className="flex-shrink-0 mx-auto lg:mx-0">
                 <RiskScore score={report.riskScore} size="lg" />
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">{report.summary}</p>
                 <div className="flex flex-wrap gap-2">
                   <span className="text-xs font-mono bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Confidence: {report.confidenceScore}%</span>
                   <span className="text-xs font-mono bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Type: {report.type}</span>
                   <span className="text-xs font-mono bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Score: {report.riskScore}/100</span>
                 </div>
               </div>
             </div>

             {report.scoreBreakdown && (
               <div className="mb-8">
                 <ScoreBreakdown factors={report.scoreBreakdown} totalScore={report.riskScore} />
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
              {report.details?.ssl && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`trust-badge ${report.details.ssl.valid ? 'trust-badge-safe' : 'trust-badge-danger'}`}>
                      {report.details.ssl.valid ? 'Valid' : 'Invalid'}
                    </span>
                    <h3 className="font-semibold text-[var(--text-primary)]">SSL Certificate</h3>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] space-y-1">
                    <p>Issuer: {report.details.ssl.issuer}</p>
                    <p>Expires: {new Date(report.details.ssl.expiresAt).toLocaleDateString()}</p>
                  </div>
                </Card>
              )}

              {report.details?.domainAge && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="trust-badge trust-badge-neutral">Domain Age</span>
                    <h3 className="font-semibold text-[var(--text-primary)]">Registration Details</h3>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] space-y-1">
                    <p>Created: {new Date(report.details.domainAge.created).toLocaleDateString()}</p>
                    <p>Age: {report.details.domainAge.daysSinceCreation} days</p>
                  </div>
                </Card>
              )}

              {report.details?.blacklists && report.details.blacklists.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="trust-badge trust-badge-neutral">Blacklist Check</span>
                    <h3 className="font-semibold text-[var(--text-primary)]">Threat Databases</h3>
                  </div>
                  {report.details.blacklists.map((b: BlacklistItem) => (
                    <div key={b.name} className="flex items-center justify-between text-sm text-[var(--text-secondary)] py-1.5 border-b border-[var(--border)] last:border-0">
                      <span>{b.name}</span>
                      <span className={`trust-badge ${b.listed ? 'trust-badge-danger' : 'trust-badge-safe'}`}>
                        {b.listed ? 'Listed' : 'Clear'}
                      </span>
                    </div>
                  ))}
                </Card>
              )}

              {report.details?.aiAnalysis && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="trust-badge trust-badge-neutral">AI Analysis</span>
                    <h3 className="font-semibold text-[var(--text-primary)]">Pattern Detection</h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{report.details.aiAnalysis.summary}</p>
                </Card>
              )}
            </div>

            {report.details?.detectedRisks && report.details.detectedRisks.length > 0 && (
              <Card className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="trust-badge trust-badge-danger">Detected</span>
                  <h3 className="font-semibold text-[var(--text-primary)]">Risk Factors</h3>
                </div>
                <ul className="space-y-2.5">
                  {report.details.detectedRisks.map((risk: RiskItem, i: number) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        risk.severity === 'critical' ? 'bg-[var(--trust-critical)]' :
                        risk.severity === 'high' ? 'bg-[var(--trust-danger)]' :
                        risk.severity === 'medium' ? 'bg-[var(--trust-warning)]' : 'bg-[var(--trust-safe)]'
                      }`} />
                      {risk.description}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {report.recommendations && report.recommendations.length > 0 && (
              <Card className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="trust-badge trust-badge-safe">Guidance</span>
                  <h3 className="font-semibold text-[var(--text-primary)]">Recommendations</h3>
                </div>
                <ul className="space-y-2.5">
                  {report.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2.5">
                      <span className="text-[var(--text-accent)] mt-0.5 text-lg leading-none">›</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>
      </ErrorBoundary>
    </>
  );
}
