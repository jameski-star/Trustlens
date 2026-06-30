import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, MapPin, Wifi, Building2 } from 'lucide-react';

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
import { useScanSms, useScanPhone } from '../hooks/useScan';
import { ShieldAlert, RefreshCw } from 'lucide-react';

type ScanMode = 'sms' | 'phone';

export default function SMSChecker() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const scanSms = useScanSms();
  const scanPhone = useScanPhone();
  const queryParam = searchParams.get('q');
  const modeParam = (searchParams.get('mode') as ScanMode) || 'sms';

  const scan = modeParam === 'phone' ? scanPhone.mutate : scanSms.mutate;
  const report = modeParam === 'phone' ? scanPhone.data : scanSms.data;
  const isPending = modeParam === 'phone' ? scanPhone.isPending : scanSms.isPending;
  const isError = modeParam === 'phone' ? scanPhone.isError : scanSms.isError;

  useEffect(() => {
    if (queryParam) scan(queryParam);
  }, [queryParam, modeParam]);

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
        description="Check if a phone number or SMS message is associated with known scams. Free security analysis."
      />
      <ErrorBoundary>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: modeParam === 'phone' ? 'Phone Checker' : 'SMS Checker' }]} />
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FFFBEB] rounded-xl flex items-center justify-center">
              {modeParam === 'phone' ? (
                <Phone className="w-5 h-5 text-[#D97706]" />
              ) : (
                <MessageSquare className="w-5 h-5 text-[#D97706]" />
              )}
            </div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">
              {modeParam === 'phone' ? 'Phone Number Checker' : 'SMS & Phone Checker'}
            </h1>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => switchMode('sms')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                modeParam === 'sms'
                  ? 'bg-[var(--text-accent)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-1.5" />
              SMS Message
            </button>
            <button
              onClick={() => switchMode('phone')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                modeParam === 'phone'
                  ? 'bg-[var(--text-accent)] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                <h2 className="font-heading font-700 text-xl text-[var(--text-primary)] mb-2">
                  {modeParam === 'phone' ? 'Phone Number Analysis Result' : 'SMS Analysis Result'}
                </h2>
                <p className="text-[var(--text-secondary)] mb-4">{report.summary}</p>
              </div>
            </div>

            {(report.details as any)?.phoneInfo && (
              <Card className="mb-8">
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Phone Number Information</h3>
                <div className="space-y-2 text-sm">
                  {((report.details as any).phoneInfo.organization) && (
                    <div className="flex items-center gap-2 text-[#2563EB]">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">{(report.details as any).phoneInfo.organization}</span>
                    </div>
                  )}
                  {((report.details as any).phoneInfo.country) && (
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <MapPin className="w-4 h-4" />
                      <span>Location: {(report.details as any).phoneInfo.country}</span>
                    </div>
                  )}
                  {((report.details as any).phoneInfo.provider) && (
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Phone className="w-4 h-4" />
                      <span>Provider: {(report.details as any).phoneInfo.provider}</span>
                    </div>
                  )}
                  {((report.details as any).phoneInfo.isVirtual) && (
                    <div className="flex items-center gap-2 text-[#D97706]">
                      <Wifi className="w-4 h-4" />
                      <span className="font-medium">Virtual/VoIP Number — often used by scammers</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <Card className="mb-8">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">Detected Risks</h3>
              {(report.details as any)?.detectedRisks?.length > 0 ? (
                <ul className="space-y-2">
                  {((report.details as any).detectedRisks as RiskItem[] | undefined)?.map((risk: RiskItem, i: number) => (
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
