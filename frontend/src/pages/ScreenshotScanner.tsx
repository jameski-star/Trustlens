import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { scanUrl } from '../api/client';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';

export default function ScreenshotScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | { text: string; risk: string }>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) return alert('File too large. Max 10MB.');
    setFile(f);
    setPreview(URL.createObjectURL(f));
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
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const report = await scanUrl(base64);
        setResult({ text: report.summary || 'Analysis completed successfully.', risk: report.riskLevel });
        setAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setResult({ text: 'Analysis failed. Please try again.', risk: 'unknown' });
      setAnalyzing(false);
    }
  };

  return (
    <>
      <SEOHead title="Screenshot Scanner - Analyze Images for Threats" description="Upload screenshots to scan for phishing attempts, scam content, and security threats using OCR technology." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Screenshot Scanner' }]} />
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FEF2F2] rounded-xl flex items-center justify-center"><Camera className="w-5 h-5 text-[#DC2626]" /></div>
            <h1 className="font-heading font-700 text-xl md:text-3xl text-[#0F172A]">Screenshot Scanner</h1>
          </div>
          <p className="text-[#475569] mb-6">Upload a screenshot to scan for phishing attempts, scam content, and suspicious text using OCR technology.</p>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-[#E2E8F0] rounded-2xl p-12 text-center hover:border-[#2563EB] transition-colors cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-80 mx-auto rounded-xl" />
                <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-[#475569] mx-auto mb-4" />
                <p className="text-[#475569] font-medium">Drop screenshot here or click to upload</p>
                <p className="text-sm text-[#475569] mt-1">PNG, JPG, WEBP (max 10MB)</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {file && !result && (
            <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary mt-6 w-full">
              {analyzing && <Loader2 className="w-4 h-4 animate-spin" />}
              Analyze Screenshot
            </button>
          )}

          {result && (
            <Card className="mt-6">
              <h3 className="font-semibold mb-2">Analysis Result</h3>
              <p className="text-sm text-[#475569]">{result.text}</p>
              {result.risk === 'safe' && <span className="inline-block mt-2 text-xs font-medium text-[#16A34A] bg-[#F0FDF4] px-2 py-1 rounded-lg">No threats detected</span>}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
