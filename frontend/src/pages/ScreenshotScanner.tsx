import { useState, useRef } from 'react';
import { Camera, Upload, X, ExternalLink, Mail, Phone, AlertTriangle, FileText, Shield, CheckCircle2, Link } from 'lucide-react';
import { scanScreenshot } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import ScanAnimation from '../components/ScanAnimation';
import ErrorBoundary from '../components/ErrorBoundary';
import Breadcrumbs from '../components/Breadcrumbs';
import RiskScore from '../components/RiskScore';
import { SITE_URL } from '../config';

interface DetectedRisk {
  category: string;
  severity: string;
  description: string;
}

interface ScannedItem {
  url?: string;
  email?: string;
  phone?: string;
  riskScore: number;
  summary: string;
  risks: string[];
  provider?: string;
  country?: string;
  isVirtual?: boolean;
  isDisposable?: boolean;
  organization?: string;
}

interface ScreenshotResult {
  summary: string;
  riskScore: number;
  riskLevel: string;
  details: {
    ocrText?: string;
    urlsFound?: ScannedItem[];
    emailsFound?: ScannedItem[];
    phonesFound?: ScannedItem[];
    scamPatterns?: ScannedPattern[];
    detectedRisks?: DetectedRisk[];
  };
}

interface ScannedPattern {
  matched: string;
  label: string;
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
};

export default function ScreenshotScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScreenshotResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) return alert('File too large. Max 10MB.');
    setFile(f);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(f);
    setPreview(previewUrlRef.current);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      const report = await scanScreenshot(base64);
      setResult({
        summary: report.summary || 'Analysis completed successfully.',
        riskScore: report.riskScore,
        riskLevel: report.riskLevel,
        details: report.details || {},
      });
    } catch {
      setResult({
        summary: 'Analysis failed. Please try again.',
        riskScore: 50,
        riskLevel: 'unknown',
        details: {},
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const risks = result?.details?.detectedRisks || [];
  const urls = result?.details?.urlsFound || [];
  const emails = result?.details?.emailsFound || [];
  const phones = result?.details?.phonesFound || [];
  const patterns = result?.details?.scamPatterns || [];

  return (
    <>
      <SEOHead title="Screenshot Scanner - Analyze Images for Threats" description="Upload screenshots to scan for phishing attempts, scam content, and security threats using OCR technology." />
      <ErrorBoundary>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Screenshot Scanner' }]} />
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FEF2F2] rounded-xl flex items-center justify-center"><Camera className="w-5 h-5 text-[#DC2626]" /></div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">Screenshot Scanner</h1>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">Upload a screenshot to scan for phishing attempts, scam content, and suspicious text using OCR technology.</p>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center hover:border-[var(--border-accent)] transition-colors cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-80 mx-auto rounded-xl" />
                <button onClick={() => { if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; setFile(null); setPreview(null); setResult(null); }} className="absolute top-2 right-2 p-1 bg-[var(--bg-surface)] rounded-full shadow"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)] font-medium">Drop screenshot here or click to upload</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">PNG, JPG, WEBP (max 10MB)</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          <div className="flex items-start gap-2 mt-4 p-3 bg-[#F0FDF4] rounded-xl">
            <Shield className="w-4 h-4 text-[#16A34A] mt-0.5 shrink-0" />
            <p className="text-xs text-[#166534] leading-relaxed">
              <strong>Your privacy is protected.</strong> Screenshots are processed entirely in-memory and deleted immediately after analysis. We do not store, cache, or share your images.
            </p>
          </div>

          {file && !result && !analyzing && (
            <button onClick={handleAnalyze} className="btn-primary mt-6 w-full">
              <Camera className="w-4 h-4" />
              Analyze Screenshot
            </button>
          )}

          {analyzing && <ScanAnimation type="screenshot" />}

          {result && (
            <div className="mt-6 space-y-4">
              <Card>
                <div className="flex items-start gap-6 flex-wrap">
                  <RiskScore score={result.riskScore} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-600 text-lg mb-1">Analysis Result</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{result.summary}</p>
                  </div>
                </div>
              </Card>

              {risks.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                    <h3 className="font-heading font-600">Detected Risks ({risks.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {risks.map((r, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm p-2 rounded-lg bg-[var(--bg-subtle)]">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${severityColors[r.severity] || 'bg-gray-100 text-gray-800'}`}>
                          {r.severity}
                        </span>
                        <span className="text-[var(--text-primary)]">{r.description}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {urls.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Link className="w-5 h-5 text-[#2563EB]" />
                    <h3 className="font-heading font-600">URLs Found ({urls.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {urls.map((item, i) => (
                      <div key={i} className="text-sm p-3 rounded-lg bg-[var(--bg-subtle)] space-y-1">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          <code className="text-xs break-all">{item.url}</code>
                          <RiskScore score={item.riskScore} size="sm" showLabel={false} />
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">{item.summary}</p>
                        {item.risks.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {item.risks.map((risk, j) => (
                              <li key={j} className="flex items-start gap-1.5 text-xs text-[#DC2626]">
                                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {emails.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-5 h-5 text-[#2563EB]" />
                    <h3 className="font-heading font-600">Emails Found ({emails.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {emails.map((item, i) => (
                      <div key={i} className="text-sm p-3 rounded-lg bg-[var(--bg-subtle)] space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          <code className="text-xs break-all">{item.email}</code>
                          <RiskScore score={item.riskScore} size="sm" showLabel={false} />
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {item.provider && <span className="text-xs text-[var(--text-secondary)]">Provider: {item.provider}</span>}
                          {item.organization && <span className="text-xs text-[#2563EB]">{item.organization}</span>}
                          {item.isDisposable && <span className="text-xs text-[#D97706] font-medium">Disposable/Temp Email</span>}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">{item.summary}</p>
                        {item.risks.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {item.risks.map((risk, j) => (
                              <li key={j} className="flex items-start gap-1.5 text-xs text-[#DC2626]">
                                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {phones.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-5 h-5 text-[#2563EB]" />
                    <h3 className="font-heading font-600">Phone Numbers Found ({phones.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {phones.map((item, i) => (
                      <div key={i} className="text-sm p-3 rounded-lg bg-[var(--bg-subtle)] space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          <code className="text-xs break-all">{item.phone}</code>
                          <RiskScore score={item.riskScore} size="sm" showLabel={false} />
                        </div>
                        {item.country && <span className="inline-block text-xs text-[var(--text-secondary)]">Location: {item.country}</span>}
                        {item.provider && <span className="inline-block text-xs text-[var(--text-secondary)] ml-2">Provider: {item.provider}</span>}
                        {item.isVirtual && <span className="inline-block text-xs text-[#D97706] ml-2 font-medium">Virtual/VoIP Number</span>}
                        <p className="text-xs text-[var(--text-secondary)]">{item.summary}</p>
                        {item.risks.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {item.risks.map((risk, j) => (
                              <li key={j} className="flex items-start gap-1.5 text-xs text-[#DC2626]">
                                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {patterns.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-[#D97706]" />
                    <h3 className="font-heading font-600">Scam Patterns Detected ({patterns.length})</h3>
                  </div>
                  <div className="space-y-1.5">
                    {patterns.map((p, i) => (
                      <div key={i} className="text-xs p-2 rounded-lg bg-[var(--bg-subtle)] flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-[#DC2626] shrink-0" />
                        <span className="text-[var(--text-primary)]">{p.label}</span>
                        {p.matched && <code className="text-[var(--text-secondary)] truncate">"{p.matched}"</code>}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {result.details.ocrText && (
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-[var(--text-secondary)]" />
                    <h3 className="font-heading font-600">Extracted Text</h3>
                  </div>
                  <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap break-words max-h-60 overflow-y-auto p-3 rounded-lg bg-[var(--bg-subtle)]">
                    {result.details.ocrText}
                  </pre>
                </Card>
              )}

              {risks.length === 0 && urls.length === 0 && emails.length === 0 && phones.length === 0 && patterns.length === 0 && (
                <Card>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
                    <span className="font-medium text-[#16A34A]">No threats detected</span>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Screenshot Scanner - Free OCR Security Scanner',
          description: 'Upload screenshots for AI-powered threat analysis. Extract and analyze text from images for phishing and scam detection.',
          url: `${SITE_URL}/screenshot-scanner`,
          applicationCategory: 'SecurityApplication',
          operatingSystem: 'All',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }),
      }} />
      </ErrorBoundary>
    </>
  );
}
