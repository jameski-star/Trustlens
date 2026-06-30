import { useState, useRef } from 'react';
import { QrCode, X } from 'lucide-react';
import { scanQrcode } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import ScanAnimation from '../components/ScanAnimation';
import ErrorBoundary from '../components/ErrorBoundary';
import Breadcrumbs from '../components/Breadcrumbs';

export default function QRCodeScanner() {
  const [result, setResult] = useState<null | { text: string; risk: string }>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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
      const report = await scanQrcode(base64);
      setResult({ text: report.summary || 'Analysis completed.', risk: report.riskLevel });
    } catch {
      setResult({ text: 'Analysis failed. Please try again.', risk: 'unknown' });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <>
      <SEOHead title="QR Code Scanner - Check QR Codes Before Scanning" description="Scan QR codes for security threats before opening them. Free QR code security analysis." />
      <ErrorBoundary>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'QR Code Scanner' }]} />
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#F5F3FF] rounded-xl flex items-center justify-center"><QrCode className="w-5 h-5 text-[#7C3AED]" /></div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[var(--text-primary)]">QR Code Scanner</h1>
          </div>
          <p className="text-[var(--text-secondary)] mb-6">Upload a QR code image to extract and analyze the embedded URL or content before you scan it.</p>

          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border)] rounded-2xl p-12 text-center hover:border-[#7C3AED] transition-colors cursor-pointer"
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-80 mx-auto rounded-xl" />
                <button onClick={(e) => { e.stopPropagation(); if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; setFile(null); setPreview(null); setResult(null); }} className="absolute top-2 right-2 p-1 bg-[var(--bg-surface)] rounded-full shadow"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div>
                <QrCode className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
                <p className="text-[var(--text-secondary)] font-medium">Upload QR code image</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">PNG, JPG, WEBP (max 10MB)</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {file && !result && !analyzing && (
            <button onClick={handleAnalyze} className="btn-primary mt-6 w-full">
              <QrCode className="w-4 h-4" />
              Analyze QR Code
            </button>
          )}

          {analyzing && <ScanAnimation type="qrcode" />}

          {result && (
            <Card className="mt-6">
              <h3 className="font-semibold mb-2">Analysis Result</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-3">{result.text}</p>
              <span className={`inline-block text-xs font-medium px-2 py-1 rounded-lg ${result.risk === 'safe' || result.risk === 'low' ? 'text-[#16A34A] bg-[#F0FDF4]' : 'text-[#DC2626] bg-[#FEF2F2]'}`}>
                {result.risk === 'safe' || result.risk === 'low' ? 'No threats detected' : 'Potential risks detected'}
              </span>
            </Card>
          )}
        </div>
      </div>
      </ErrorBoundary>
    </>
  );
}
