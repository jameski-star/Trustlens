interface RiskScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function RiskScore({ score, size = 'md', showLabel = true }: RiskScoreProps) {
  const getColor = () => {
    if (score >= 80) return { bg: '#2563EB', text: 'Safe', level: 'safe' as const };
    if (score >= 60) return { bg: '#2563EB', text: 'Low Risk', level: 'low' as const };
    if (score >= 40) return { bg: '#0F172A', text: 'Medium Risk', level: 'medium' as const };
    if (score >= 20) return { bg: '#DC2626', text: 'High Risk', level: 'high' as const };
    return { bg: '#991B1B', text: 'Critical', level: 'critical' as const };
  };

  const { bg, text } = getColor();
  const sizeMap = { sm: { container: 'w-16 h-16', text: 'text-lg' }, md: { container: 'w-24 h-24', text: 'text-2xl' }, lg: { container: 'w-32 h-32', text: 'text-3xl' } };
  const { container: containerSize, text: textSize } = sizeMap[size];

  const radius = size === 'sm' ? 28 : size === 'md' ? 42 : 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${containerSize}`}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 ${(radius + 8) * 2} ${0} ${(radius + 8) * 2}`}>
          <circle
            cx={radius + 8}
            cy={radius + 8}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="6"
          />
          <circle
            cx={radius + 8}
            cy={radius + 8}
            r={radius}
            fill="none"
            stroke={bg}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${textSize} font-heading font-800`} style={{ color: bg }}>
            {score}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-sm font-semibold" style={{ color: bg }}>
          {text}
        </span>
      )}
    </div>
  );
}
