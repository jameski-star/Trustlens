import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface ScoreFactor {
  label: string;
  score: number;
  weight: number;
  contribution: number;
}

interface ScoreBreakdownProps {
  factors: ScoreFactor[];
  totalScore: number;
}

const BAR_COLORS = ['#2563EB', '#7C3AED', '#D97706', '#16A34A', '#DC2626'];

export default function ScoreBreakdown({ factors, totalScore }: ScoreBreakdownProps) {
  if (!factors?.length) return null;

  const totalFactorSum = factors.reduce((s, f) => s + f.contribution, 0);

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
      <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <Info className="w-4 h-4 text-[var(--text-accent)]" />
        Score Breakdown
      </h3>
      <div className="space-y-3">
        {factors.map((factor, i) => {
          const pct = Math.round((factor.contribution / Math.max(totalFactorSum, 1)) * 100);
          return (
            <div key={factor.label}>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm text-[var(--text-primary)]">{factor.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-[var(--text-secondary)]">{factor.score}/100 × {Math.round(factor.weight * 100)}%</span>
                  <motion.span
                    className="text-sm font-semibold"
                    style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    +{factor.contribution}
                  </motion.span>
                </div>
              </div>
              <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: 0.1 * i, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-baseline justify-between mt-4 pt-3 border-t border-[var(--border)]">
        <span className="text-sm font-semibold text-[var(--text-primary)]">Total Score</span>
        <motion.span
          className="text-lg font-heading font-800"
          style={{ color: totalScore >= 60 ? '#16A34A' : totalScore >= 40 ? '#D97706' : '#DC2626' }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {totalScore}/100
        </motion.span>
      </div>
    </div>
  );
}
