import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, MapPin, Wifi, Building2, Info } from 'lucide-react';
import { SITE_URL } from '../config';

interface RiskItem {
  category: string;
  severity: string;
  description: string;
}
interface PhoneInfo {
  organization?: string;
  country?: string;
  provider?: string;
  isVirtual?: boolean;
}
interface ScoreFactor {
  label: string;
  score: number;
  weight: number;
  contribution: number;
}
interface SmsReport {
  riskScore: number;
  summary: string;
  scoreBreakdown?: ScoreFactor[];
  details?: {
    phoneInfo?: PhoneInfo;
    detectedRisks?: RiskItem[];
  };
  recommendations?: string[];
}
import SEOHead from '../components/SEOHead';
import SearchBar from '../components/SearchBar';
import RiskScore from '../components/RiskScore';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';
import ScanAnimation from '../components/ScanAnimation';
import ErrorBoundary from '../components/ErrorBoundary';
import ScoreBreakdown from '../components/ScoreBreakdown';
import { useScanSms, useScanPhone } from '../hooks/useScan';
import { ShieldAlert, RefreshCw, Flag } from 'lucide-react';

type ScanMode = 'sms' | 'phone';

export default function SMSChecker() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const scanSms = useScanSms();
  const scanPhone = useScanPhone();
  const queryParam = searchParams.get('q');
  const modeParam = (searchParams.get('mode') as ScanMode) || 'sms';

  const scan = modeParam === 'phone' ? scanPhone.mutate : scanSms.mutate;
  const rawReport = modeParam === 'phone' ? scanPhone.data : scanSms.data;
  const report = rawReport as SmsReport | undefined;
  const isPending = modeParam === 'phone' ? scanPhone.isPending : scanSms.isPending;
  const isError = modeParam === 'phone' ? scanPhone.isError : scanSms.isError;

  useEffect(() => {
    if (queryParam) scan(queryParam);
  }, [queryParam, modeParam, scan]);

  const handleSearch = (input: string) => {
    navigate(`/sms-checker?q=${encodeURIComponent(input)}&mode=${modeParam}`);
  };

  const switchMode = (m: ScanMode) => {
    const params = new URLSearchParams(searchParams);
    params.set('mode', m);
    setSearchParams(params);
  };

  const placeholder = modeParam === 'phone'
    ? 'Enter a phone number (e.g. +254712345678)...'
    : 'Enter an SMS message text...';

  return (
    <>
      <SEOHead
        title={modeParam === 'phone' ? 'Phone Number Checker - Is This Number Safe?' : 'SMS Checker - Is This Text a Scam?'}
        description="Check if a phone number or SMS message is associated with known scams. Security analysis."
      />
      <ErrorBoundary>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: modeParam === 'phone' ? 'Phone Checker' : 'SMS Checker' }]} />
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[var(--bg-accent)] rounded-lg flex items-center justify-center">
              {modeParam === 'phone' ? (
                <Phone className="w-5 h-5 text-[var(--text-accent)]" />
              ) : (
                <MessageSquare className="w-5 h-5 text-[var(--text-accent)]" />
              )}
            </div>
            <div>
              <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)] text-wrap: balance">
                {modeParam === 'phone' ? 'Phone Number Checker' : 'SMS & Phone Checker'}
              </h1>
              <p className="text-xs text-[var(--text-secondary)] hidden sm:block">
                {modeParam === 'phone'
                  ? 'Verify a phone number before you engage'
                  : 'Check SMS messages for scam patterns'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => switchMode('sms')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                modeParam === 'sms'
                  ? 'bg-[var(--text-accent)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-1.5" />
              SMS Message
            </button>
            <button
              onClick={() => switchMode('phone')}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
                modeParam === 'phone'
                  ? 'bg-[var(--text-accent)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
              }`}
            >
              <Phone className="w-4 h-4 inline mr-1.5" />
              Phone Number
            </button>
          </div>

          <p className="text-[var(--text-secondary)] mb-6">
            {modeParam === 'phone'
              ? 'Verify a phone number — check if it belongs to a known organisation or has been reported as suspicious.'
              : 'Check if an SMS message, phone number, or WhatsApp message is part of a scam campaign.'}
          </p>

          <SearchBar placeholder={placeholder} onSubmit={handleSearch} isLoading={isPending} />

          <details className="mt-4">
            <summary className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-accent)] transition-colors">
              <Info className="w-4 h-4 shrink-0" />
              Privacy details
            </summary>
            <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
              {modeParam === 'phone'
                ? 'Phone numbers are checked against known scam databases only. We do not store or share your queries.'
                : 'Messages are scanned for scam patterns in real-time and are not stored, logged, or shared with third parties.'
              }
            </p>
          </details>
        </div>

        {isPending && <div className="max-w-3xl mx-auto"><ScanAnimation type="sms" /></div>}

        {isError && (
          <div className="max-w-3xl mx-auto">
            <Card className="text-center py-10">
              <div className="w-12 h-12 mx-auto mb-4 bg-[var(--trust-danger-bg)] rounded-2xl flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-[var(--trust-danger)]" />
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
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <RiskScore score={report.riskScore} size="lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-heading font-700 text-lg md:text-xl text-[var(--text-primary)] text-wrap: balance">
                    {modeParam === 'phone' ? 'Phone Number Analysis Result' : 'SMS Analysis Result'}
                  </h2>
                  <span className={`trust-badge ${report.riskScore >= 60 ? 'trust-badge-safe' : report.riskScore >= 40 ? 'trust-badge-warning' : 'trust-badge-danger'}`}>
                    {report.riskScore >= 60 ? 'Low Risk' : report.riskScore >= 40 ? 'Medium Risk' : 'High Risk'}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">{report.summary}</p>
              </div>
            </div>

            {report?.scoreBreakdown && (
              <div className="mb-8">
                <ScoreBreakdown factors={report.scoreBreakdown} totalScore={report.riskScore} />
              </div>
            )}

            {report?.details?.phoneInfo && (
              <Card className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="trust-badge trust-badge-neutral">Info</span>
                  <h3 className="font-heading font-600 text-[var(--text-primary)]">Phone Number Information</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {report.details.phoneInfo.organization && (
                    <div className="flex items-center gap-2 text-[var(--text-accent)]">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">{report.details.phoneInfo.organization}</span>
                    </div>
                  )}
                  {report.details.phoneInfo.country && (
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <MapPin className="w-4 h-4" />
                      <span>Location: {report.details.phoneInfo.country}</span>
                    </div>
                  )}
                  {report.details.phoneInfo.provider && (
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Phone className="w-4 h-4" />
                      <span>Provider: {report.details.phoneInfo.provider}</span>
                    </div>
                  )}
                  {report.details.phoneInfo.isVirtual && (
                    <div className="flex items-center gap-2 text-[var(--trust-warning)]">
                      <Wifi className="w-4 h-4" />
                      <span className="font-medium">Virtual/VoIP Number — often used by scammers</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <Card className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="trust-badge trust-badge-neutral">Detection</span>
                <h3 className="font-heading font-600 text-[var(--text-primary)]">Detected Risks</h3>
              </div>
              {report?.details?.detectedRisks && report.details.detectedRisks.length > 0 ? (
                <ul className="space-y-2">
                  {report.details.detectedRisks.map((risk, i) => (
                    <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        risk.severity === 'critical' ? 'bg-[var(--trust-critical)]' :
                        risk.severity === 'high' ? 'bg-[var(--trust-danger)]' :
                        risk.severity === 'medium' ? 'bg-[var(--trust-warning)]' : 'bg-[var(--trust-safe)]'
                      }`} />
                      <span className="leading-relaxed">{risk.description}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--trust-safe)]">No risks detected</p>
              )}
            </Card>

            <Card className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="trust-badge trust-badge-safe">Guidance</span>
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
              <Card className="mb-8 border-[var(--trust-danger)]/20">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--trust-danger-bg)] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Flag className="w-5 h-5 text-[var(--trust-danger)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-600 text-[var(--text-primary)]">Report this to the community</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">Help others stay safe by sharing this threat</p>
                  </div>
                  <button
                    onClick={() => navigate(`/community-reports?type=${modeParam}&target=${encodeURIComponent(queryParam || '')}`)}
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
          name: 'SMS Checker - SMS Scam Detector',
          description: 'Verify SMS messages and WhatsApp texts for scams. Security checker with analysis.',
          url: `${SITE_URL}/sms-checker`,
          applicationCategory: 'SecurityApplication',
          operatingSystem: 'All',
        }),
      }} />
      </ErrorBoundary>
    </>
  );
}
