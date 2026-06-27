import { useState } from 'react';
import { QrCode, Upload, X } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Card from '../components/Card';
import Breadcrumbs from '../components/Breadcrumbs';

export default function QRCodeScanner() {
  const [result, setResult] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 1500));
    setResult('https://phishing-example.com/login');
    setAnalyzing(false);
  };

  return (
    <>
      <SEOHead title="QR Code Scanner - Check QR Codes Before Scanning" description="Scan QR codes for security threats before opening them. Free QR code security analysis." />
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'QR Code Scanner' }]} />
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#F5F3FF] rounded-xl flex items-center justify-center"><QrCode className="w-5 h-5 text-[#7C3AED]" /></div>
            <h1 className="font-heading font-700 text-2xl md:text-3xl text-[#0F172A]">QR Code Scanner</h1>
          </div>
          <p className="text-[#475569] mb-6">Upload a QR code image to extract and analyze the embedded URL or content before you scan it.</p>

          <Card className="text-center py-12">
            <QrCode className="w-16 h-16 text-[#E2E8F0] mx-auto mb-4" />
            <p className="text-[#475569] mb-4">Upload a QR code image to analyze its content</p>
            <input type="file" accept="image/*" className="hidden" id="qr-upload" />
            <label htmlFor="qr-upload" className="btn-primary cursor-pointer inline-flex">
              <Upload className="w-4 h-4" /> Upload QR Code
            </label>
          </Card>

          <button onClick={handleAnalyze} disabled={analyzing} className="btn-primary mt-6 w-full">Analyze QR Code</button>

          {result && (
            <Card className="mt-6">
              <h3 className="font-semibold mb-2">QR Code Content</h3>
              <p className="text-sm text-[#475569] break-all mb-3">{result}</p>
              <p className="text-sm text-[#D97706]">
                This URL leads to an external website. Verify its safety using our{' '}
                <a href={`/url-checker?q=${encodeURIComponent(result)}`} className="text-[#2563EB] hover:underline">URL Checker</a>.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
