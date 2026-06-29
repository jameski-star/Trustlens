export const KNOWN_SCAM_EMAIL_DOMAINS = [
  'paypal-verify.com', 'paypal-security.com', 'paypal-update.com', 'paypal-login.com',
  'amazon-support.com', 'amazon-security.com', 'amazon-verify.com', 'amazon-order.com',
  'netflix-account.com', 'netflix-verify.com', 'netflix-login.com', 'netflix-update.com',
  'apple-id-verify.com', 'apple-support.com', 'apple-security.com', 'apple-icloud.com',
  'microsoft-support.com', 'office365-verify.com', 'outlook-security.com', 'windows-update.com',
  'google-verify.com', 'google-security.com', 'gmail-support.com', 'google-drive.com',
  'facebook-security.com', 'fb-support.com', 'instagram-verify.com', 'linkedin-security.com',
  'bankofamerica-verify.com', 'chase-security.com', 'wellsfargo-update.com', 'citibank-alert.com',
  'fedex-delivery.com', 'ups-tracking.com', 'dhl-express.com', 'usps-post.com',
  'irs-gov.com', 'tax-refund.com', 'social-security.com', 'gov-benefits.com',
];

export const KNOWN_SCAM_PHONE_PREFIXES = [
  '+234', '+233', '+92', '+880', '+63', '+91', '+256', '+84', '+95', '+20',
  '+212', '+213', '+216', '+218', '+220', '+221', '+222', '+223', '+224', '+225',
  '+226', '+227', '+228', '+229', '+230', '+231', '+232', '+235', '+236',
  '+237', '+238', '+239', '+240', '+241', '+242', '+243', '+244', '+245',
  '+246', '+247', '+248', '+249', '+250', '+251', '+252', '+253', '+254',
  '+255', '+256', '+257', '+258', '+260', '+261', '+262', '+263', '+264',
  '+265', '+266', '+267', '+268', '+269', '+290', '+291', '+297', '+298',
  '+299', '+350', '+351', '+352', '+353', '+354', '+355', '+356', '+357',
  '+358', '+359', '+370', '+371', '+372', '+373', '+374', '+375', '+376',
  '+377', '+378', '+379', '+380', '+381', '+382', '+383', '+385', '+386',
  '+387', '+389', '+420', '+421', '+423', '+500', '+501', '+502', '+503',
  '+504', '+505', '+506', '+507', '+508', '+509', '+590', '+591', '+592',
  '+593', '+594', '+595', '+596', '+597', '+598', '+599', '+670', '+672',
  '+673', '+674', '+675', '+676', '+677', '+678', '+679', '+680', '+681',
  '+682', '+683', '+685', '+686', '+687', '+688', '+689', '+690', '+691',
  '+692', '+850', '+852', '+853', '+855', '+856', '+870', '+880', '+881',
  '+882', '+883', '+886', '+960', '+961', '+962', '+963', '+964', '+965',
  '+966', '+967', '+968', '+970', '+971', '+972', '+973', '+974', '+975',
  '+976', '+977', '+978', '+979', '+992', '+993', '+994', '+995', '+996',
  '+998',
];

export const KNOWN_PHISHING_SUBJECT_PATTERNS = [
  'account suspended', 'account blocked', 'account limited', 'account restricted',
  'verify your account', 'confirm your account', 'validate your account',
  'unusual activity', 'suspicious activity', 'unauthorized access',
  'security alert', 'security notice', 'security warning',
  'payment failed', 'payment declined', 'billing issue', 'invoice attached',
  'you won', 'congratulations', 'you are a winner', 'claim your prize',
  'action required', 'immediate action', 'urgent response',
  'password expired', 'update your password', 'change password',
  'document shared', 'file shared with you', 'new voicemail',
  'package delivery', 'shipment tracking', 'delivery failed',
  'tax refund', 'stimulus payment', 'government grant',
  'investment opportunity', 'cryptocurrency', 'bitcoin investment',
  'employment offer', 'work from home', 'make money fast',
];

export const KNOWN_SCAM_TEMPLATES = [
  { pattern: /dear (?:customer|user|client|account (?:holder|owner))/i, label: 'Generic greeting' },
  { pattern: /(?:click|tap) (?:the link|here|below|to verify)/i, label: 'Call to action link' },
  { pattern: /(?:within|in) (?:24|48|12|6|2) hours/i, label: 'Artificial urgency' },
  { pattern: /failure to (?:comply|verify|respond|update)/i, label: 'Threat of consequences' },
  { pattern: /(?:log|sign) in (?:to|using the) (?:link|button|below)/i, label: 'Login link phishing' },
  { pattern: /(?:confirm|provide|verify|update) (?:your|my) (?:account|payment|billing|personal)/i, label: 'Information harvesting' },
  { pattern: /(?:cryptocurrency|bitcoin|invest|trading) (?:platform|opportunity|guaranteed)/i, label: 'Crypto investment scam' },
  { pattern: /(?:western union|money gram|gift card|wire transfer)/i, label: 'Irreversible payment request' },
  { pattern: /(?:inheritance|estate|fund|donation).{0,30}(?:million|billion|thousand)/i, label: 'Advance fee fraud' },
  { pattern: /(?:romance|dating|single|matrimonial|soulmate)/i, label: 'Romance scam indicators' },
  { pattern: /(?:remote|work from home|data entry|virtual assistant).{0,20}(?:salary|income|pay)/i, label: 'Job scam indicators' },
  { pattern: /(?:guaranteed|risk.?free|no.?risk|double your).{0,20}(?:return|profit|income)/i, label: 'Investment scam promises' },
];

export function detectPhishingSubject(subject: string): string[] {
  const lower = subject.toLowerCase();
  return KNOWN_PHISHING_SUBJECT_PATTERNS.filter(p => lower.includes(p));
}

export function detectScamTemplates(text: string): { matched: string; label: string }[] {
  return KNOWN_SCAM_TEMPLATES
    .filter(t => t.pattern.test(text))
    .map(t => ({ matched: text.match(t.pattern)?.[0] || '', label: t.label }));
}

export function isKnownScamDomain(domain: string): boolean {
  return KNOWN_SCAM_EMAIL_DOMAINS.some(d => domain.includes(d) || domain === d);
}

export function isHighRiskPhone(phone: string): boolean {
  return KNOWN_SCAM_PHONE_PREFIXES.some(p => phone.startsWith(p));
}
