import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getReport } from '../api/client';

interface BlacklistItem {
  name: string;
  listed: boolean;
  source: string;
}
import SEOHead from '../components/SEOHead';
import RiskScore from '../components/RiskScore';
import Card from '../components/Card';
import { ReportSkeleton } from '../components/Skeleton';
import Breadcrumbs from '../components/Breadcrumbs';
import { Download } from 'lucide-react';
import apiClient from '../api/client';

export default function Result() {
  const { shareId } = useParams<{ shareId: string }>();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', shareId],
    queryFn: () => getReport(shareId!),
    enabled: !!shareId,
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
      <div className="container-page py-8">
        <Breadcrumbs items={[
          { label: 'Analysis Report', href: '#' },
          { label: shareId || '' },
        ]} />

        {isLoading && <ReportSkeleton />}
        {error && <Card><p className="text-[#DC2626]">Report not found</p></Card>}

        {report && (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-heading font-700 text-xl md:text-2xl text-[var(--text-primary)] mb-1">Security Analysis Report</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Analyzed: {report.input || 'N/A'} &middot; {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={handleDownloadPdf} className="btn-secondary text-sm">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-8 mb-8">
              <RiskScore score={report.riskScore} size="lg" />
              <div className="flex-1">
                <p className="text-[var(--text-secondary)] mb-4">{report.summary}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-mono bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Confidence: {report.confidenceScore}%</span>
                  <span className="text-xs font-mono bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Type: {report.type}</span>
                  <span className="text-xs font-mono bg-[var(--bg-subtle)] px-3 py-1.5 rounded-lg">Score: {report.riskScore}/100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {report.details?.ssl && (
                <Card>
                  <h3 className="font-semibold mb-2">SSL Certificate</h3>
                  <div className="text-sm text-[var(--text-secondary)] space-y-1">
                    <p>Valid: {report.details.ssl.valid ? 'Yes' : 'No'}</p>
                    <p>Issuer: {report.details.ssl.issuer}</p>
                    <p>Expires: {new Date(report.details.ssl.expiresAt).toLocaleDateString()}</p>
                  </div>
                </Card>
              )}

              {report.details?.domainAge && (
                <Card>
                  <h3 className="font-semibold mb-2">Domain Age</h3>
                  <div className="text-sm text-[var(--text-secondary)] space-y-1">
                    <p>Created: {new Date(report.details.domainAge.created).toLocaleDateString()}</p>
                    <p>Age: {report.details.domainAge.daysSinceCreation} days</p>
                  </div>
                </Card>
              )}

              {report.details?.blacklists && report.details.blacklists.length > 0 && (
                <Card>
                  <h3 className="font-semibold mb-2">Blacklist Check</h3>
                  {report.details.blacklists.map((b: BlacklistItem) => (
                    <div key={b.name} className="flex justify-between text-sm text-[var(--text-secondary)] py-1">
                      <span>{b.name}</span>
                      <span className={b.listed ? 'text-[#DC2626]' : 'text-[#16A34A]'}>{b.listed ? 'Listed' : 'Clear'}</span>
                    </div>
                  ))}
                </Card>
              )}

              {report.details?.aiAnalysis && (
                <Card>
                  <h3 className="font-semibold mb-2">AI Analysis</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{report.details.aiAnalysis.summary}</p>
                </Card>
              )}
            </div>

            {report.recommendations && report.recommendations.length > 0 && (
              <Card className="mb-8">
                <h3 className="font-semibold mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {report.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className="text-[var(--text-accent)] mt-0.5">&#8226;</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
}
