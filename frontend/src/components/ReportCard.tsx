import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, Info, Shield, ExternalLink } from 'lucide-react';

interface ReportCardProps {
  report: {
    shareId: string;
    input: string;
    type: string;
    riskScore: number;
    riskLevel: string;
    summary: string;
    confidenceScore: number;
    createdAt: string;
  };
}

export default function ReportCard({ report }: ReportCardProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'text-[#16A34A]';
    if (score >= 60) return 'text-[#22C55E]';
    if (score >= 40) return 'text-[#D97706]';
    return 'text-[#DC2626]';
  };

  const getIcon = (level: string) => {
    switch (level) {
      case 'safe': return <CheckCircle className="w-5 h-5 text-[#16A34A]" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-[#22C55E]" />;
      case 'medium': return <Info className="w-5 h-5 text-[#D97706]" />;
      default: return <AlertCircle className="w-5 h-5 text-[#DC2626]" />;
    }
  };

  return (
    <Link to={`/result/${report.shareId}`} className="block card hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-[#475569] uppercase">{report.type}</span>
            <span className="text-[#E2E8F0]">|</span>
            <span className="text-xs text-[#475569]">
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="font-semibold text-[#0F172A] truncate mb-2">{report.input}</h3>
          <p className="text-sm text-[#475569] line-clamp-2">{report.summary}</p>
        </div>
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className={`text-2xl font-heading font-800 ${getColor(report.riskScore)}`}>
            {report.riskScore}
          </span>
          <div className="flex items-center gap-1">
            {getIcon(report.riskLevel)}
            <span className="text-xs text-[#475569]">Conf: {report.confidenceScore}%</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-[#2563EB]">
        <ExternalLink className="w-3 h-3" />
        View full report
      </div>
    </Link>
  );
}
