import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Search, Database, Globe, FileText } from 'lucide-react';

const steps = [
  { icon: Search, text: 'Initiating secure scan...', detail: 'Establishing encrypted connection' },
  { icon: Database, text: 'Analyzing content patterns...', detail: 'Cross-referencing threat databases' },
  { icon: Globe, text: 'Checking security signatures...', detail: 'Verifying certificates and reputation' },
  { icon: ShieldCheck, text: 'Scanning for threats...', detail: 'Running deep pattern analysis' },
  { icon: FileText, text: 'Generating report...', detail: 'Compiling security findings' },
];

export default function ScanAnimation({ type = 'content' }: { type?: string }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep(prev => Math.min(prev + 1, steps.length - 1));
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 100));
    }, 150);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative w-36 h-36 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#2563EB]/10"
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#2563EB]/5"
          style={{ transform: 'scale(1.2)' }}
        />
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
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 bg-[#EFF6FF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2563EB]/10"
          >
            <ShieldCheck className="w-8 h-8 text-[#2563EB]" />
          </motion.div>
        </div>
      </div>

      <div className="h-16 relative text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-[var(--text-primary)] font-heading font-600 text-lg mb-1">
              {steps[step].text}
            </p>
            <p className="text-[var(--text-secondary)] text-sm">
              {steps[step].detail}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-64 max-w-full mt-6">
        <div className="h-1 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#2563EB] rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i <= step ? 'bg-[#2563EB]' : 'bg-[var(--bg-subtle)]'
            }`}
            animate={i === step ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}
