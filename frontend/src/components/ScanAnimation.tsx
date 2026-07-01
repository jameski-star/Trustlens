import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Search, Database, Globe, FileText, MapPin, Mail, Camera, Smartphone, CheckCircle2 } from 'lucide-react';

const stageMap: Record<string, { icon: typeof Search; text: string; detail: string }[]> = {
  url: [
    { icon: Search, text: 'Resolving domain...', detail: 'Looking up DNS records' },
    { icon: Database, text: 'Checking reputation databases...', detail: 'Querying threat intelligence feeds' },
    { icon: Globe, text: 'Running WHOIS lookup...', detail: 'Checking domain registration details' },
    { icon: Globe, text: 'Scraping site content...', detail: 'Analyzing page structure and forms' },
    { icon: ShieldCheck, text: 'Analyzing with AI...', detail: 'Running deep pattern analysis' },
    { icon: FileText, text: 'Generating report...', detail: 'Compiling security findings' },
  ],
  email: [
    { icon: Mail, text: 'Validating email format...', detail: 'Checking syntax and structure' },
    { icon: Database, text: 'Checking domain reputation...', detail: 'Cross-referencing known phishing domains' },
    { icon: Globe, text: 'Running WHOIS lookup...', detail: 'Checking when the domain was registered' },
    { icon: Search, text: 'Cross-referencing known scams...', detail: 'Matching against scam databases' },
    { icon: ShieldCheck, text: 'Analyzing with AI...', detail: 'Detecting phishing indicators' },
    { icon: FileText, text: 'Generating report...', detail: 'Compiling security findings' },
  ],
  sms: [
    { icon: Smartphone, text: 'Analyzing content patterns...', detail: 'Scanning for scam language indicators' },
    { icon: Database, text: 'Checking phone reputation...', detail: 'Looking up carrier and location info' },
    { icon: Search, text: 'Cross-referencing scam databases...', detail: 'Matching known scam templates' },
    { icon: MapPin, text: 'Verifying phone number...', detail: 'Checking against known contacts' },
    { icon: ShieldCheck, text: 'Analyzing with AI...', detail: 'Running deep pattern analysis' },
    { icon: FileText, text: 'Generating report...', detail: 'Compiling security findings' },
  ],
  phone: [
    { icon: Smartphone, text: 'Validating phone number...', detail: 'Checking format and country code' },
    { icon: Database, text: 'Looking up carrier info...', detail: 'Identifying network provider' },
    { icon: Globe, text: 'Checking scam databases...', detail: 'Searching for known scam numbers' },
    { icon: MapPin, text: 'Checking official contacts...', detail: 'Looking up known organisations' },
    { icon: ShieldCheck, text: 'Analyzing with AI...', detail: 'Running deep pattern analysis' },
    { icon: FileText, text: 'Generating report...', detail: 'Compiling security findings' },
  ],
  screenshot: [
    { icon: Camera, text: 'Extracting text from image...', detail: 'Running OCR text recognition' },
    { icon: Search, text: 'Detecting URLs and contacts...', detail: 'Identifying embedded links and phones' },
    { icon: Globe, text: 'Scanning extracted content...', detail: 'Analyzing found URLs and emails' },
    { icon: ShieldCheck, text: 'Analyzing with AI...', detail: 'Detecting scam patterns in text' },
    { icon: FileText, text: 'Generating report...', detail: 'Compiling security findings' },
  ],
};

const defaultStages = [
  { icon: Search, text: 'Initiating secure scan...', detail: 'Establishing encrypted connection' },
  { icon: Database, text: 'Analyzing content patterns...', detail: 'Cross-referencing threat databases' },
  { icon: Globe, text: 'Checking security signatures...', detail: 'Verifying certificates and reputation' },
  { icon: ShieldCheck, text: 'Scanning for threats...', detail: 'Running deep pattern analysis' },
  { icon: FileText, text: 'Generating report...', detail: 'Compiling security findings' },
];

export default function ScanAnimation({ type = 'content' }: { type?: string }) {
  const steps = stageMap[type] || defaultStages;
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          setCompleted(true);
          return prev;
        }
        return prev + 1;
      });
    }, 2800);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 100));
    }, 150);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4">
      <div className="relative w-28 h-28 md:w-36 md:h-36 mb-6 md:mb-8">
        <motion.div className="absolute inset-0 rounded-full border-2 border-[#2563EB]/10" />
        <motion.div className="absolute inset-0 rounded-full border-2 border-[#2563EB]/5" style={{ transform: 'scale(1.2)' }} />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 55%, rgba(37,99,235,0.06) 55%, rgba(37,99,235,0.15) 72%, transparent 78%)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 180deg, transparent 55%, rgba(37,99,235,0.04) 55%, rgba(37,99,235,0.1) 70%, transparent 76%)',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: completed ? 1 : [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: completed ? 0 : Infinity, ease: 'easeInOut' }}
            className="w-12 h-12 md:w-16 md:h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2563EB]/10"
          >
            {completed ? (
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-[#2563EB]" />
            ) : (
              <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-[#2563EB]" />
            )}
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              {steps.slice(0, step).map((s, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-[#2563EB]/10 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-[#2563EB]" />
                </div>
              ))}
            </div>
            <p className="text-[var(--text-primary)] font-heading font-600 text-base md:text-lg mb-1">
              {completed ? 'Analysis Complete!' : steps[step].text}
            </p>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm">
              {steps[step].detail}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-48 md:w-64 max-w-full mt-4 md:mt-6">
        <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#2563EB] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex gap-1.5 mt-3 md:mt-4">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full ${i <= step ? 'bg-[#2563EB]' : 'bg-[var(--bg-subtle)]'}`}
            animate={i === step && !completed ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}
