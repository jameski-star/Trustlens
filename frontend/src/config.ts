export const SITE_URL: string =
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://www.trustlens.website');

export const SITE_NAME = 'TrustLens';
export const SITE_DESCRIPTION = 'Free cybersecurity analysis platform. Check URLs, emails, SMS, and more for scams and phishing attempts.';
