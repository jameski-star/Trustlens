import { describe, it, expect } from 'vitest';

function calculateRiskLevel(score: number): string {
  if (score >= 80) return 'safe';
  if (score >= 60) return 'low';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'high';
  return 'critical';
}

function getRiskColor(level: string): string {
  const colors: Record<string, string> = {
    safe: '#16A34A',
    low: '#22C55E',
    medium: '#D97706',
    high: '#DC2626',
    critical: '#991B1B',
  };
  return colors[level] || '#475569';
}

function getRiskLabel(level: string): string {
  const labels: Record<string, string> = {
    safe: 'Safe', low: 'Low Risk', medium: 'Medium Risk',
    high: 'High Risk', critical: 'Critical',
  };
  return labels[level] || 'Unknown';
}

describe('calculateRiskLevel', () => {
  it('should return safe for score >= 80', () => {
    expect(calculateRiskLevel(85)).toBe('safe');
  });
  it('should return low for score >= 60', () => {
    expect(calculateRiskLevel(65)).toBe('low');
  });
  it('should return medium for score >= 40', () => {
    expect(calculateRiskLevel(45)).toBe('medium');
  });
  it('should return high for score >= 20', () => {
    expect(calculateRiskLevel(25)).toBe('high');
  });
  it('should return critical for score < 20', () => {
    expect(calculateRiskLevel(10)).toBe('critical');
  });
});

describe('getRiskColor', () => {
  it('should return green for safe', () => {
    expect(getRiskColor('safe')).toBe('#16A34A');
  });
  it('should return red for critical', () => {
    expect(getRiskColor('critical')).toBe('#991B1B');
  });
});

describe('getRiskLabel', () => {
  it('should return correct labels', () => {
    expect(getRiskLabel('safe')).toBe('Safe');
    expect(getRiskLabel('critical')).toBe('Critical');
  });
});
