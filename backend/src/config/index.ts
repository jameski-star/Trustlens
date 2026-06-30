import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  whois: {
    maxFailures: parseInt(process.env.WHOIS_MAX_FAILURES || '1', 10),
    retryIntervalMs: parseInt(process.env.WHOIS_RETRY_INTERVAL_MS || '300000', 10),
    rdapTimeoutMs: parseInt(process.env.WHOIS_RDAP_TIMEOUT_MS || '8000', 10),
    lookupTimeoutMs: parseInt(process.env.WHOIS_LOOKUP_TIMEOUT_MS || '10000', 10),
    bootstrapTimeoutMs: parseInt(process.env.WHOIS_BOOTSTRAP_TIMEOUT_MS || '4000', 10),
  },
  mistral: {
    apiKey: process.env.MISTRAL_API_KEY || '',
    model: process.env.MISTRAL_MODEL || 'mistral-small-latest',
    timeoutMs: parseInt(process.env.MISTRAL_TIMEOUT_MS || '20000', 10),
    maxTokens: parseInt(process.env.MISTRAL_MAX_TOKENS || '300', 10),
    rateLimitIntervalMs: parseInt(process.env.MISTRAL_RATE_LIMIT_INTERVAL_MS || '60000', 10),
  },
  nvidia: {
    apiKey: process.env.NVIDIA_API_KEY || '',
    model: process.env.NVIDIA_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct',
    timeoutMs: parseInt(process.env.NVIDIA_TIMEOUT_MS || '20000', 10),
    maxTokens: parseInt(process.env.NVIDIA_MAX_TOKENS || '300', 10),
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    timeoutMs: parseInt(process.env.GEMINI_TIMEOUT_MS || '20000', 10),
    maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '300', 10),
  },
  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '5242880', 10),
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  },
  rssFeeds: (() => {
    try {
      const raw = process.env.RSS_FEEDS;
      return raw ? JSON.parse(raw) as { url: string; category: string }[] : [];
    } catch {
      return [];
    }
  })(),
  googleSafeBrowsingApiKey: process.env.GOOGLE_SAFE_BROWSING_API_KEY || '',
  abuseIpDbApiKey: process.env.ABUSEIPDB_API_KEY || '',
};
