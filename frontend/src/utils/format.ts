export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(date);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

export function truncate(text: string, length = 100): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trimEnd() + '...';
}

export function getRiskColor(score: number): string {
  if (score >= 80) return '#16A34A';
  if (score >= 60) return '#22C55E';
  if (score >= 40) return '#D97706';
  if (score >= 20) return '#DC2626';
  return '#991B1B';
}

export function getRiskLabel(score: number): string {
  if (score >= 80) return 'Safe';
  if (score >= 60) return 'Low Risk';
  if (score >= 40) return 'Medium Risk';
  if (score >= 20) return 'High Risk';
  return 'Critical';
}

export function isValidUrl(str: string): boolean {
  try {
    new URL(str.startsWith('http') ? str : 'https://' + str);
    return true;
  } catch {
    return false;
  }
}

export function isValidEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}
