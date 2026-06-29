import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/trustlens',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,https://www.trustlens.website,https://trustlens.website').split(',').map(s => s.trim().replace(/\/+$/, '')),
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
    maxFailures: parseInt(process.env.WHOIS_MAX_FAILURES || '5', 10),
    retryIntervalMs: parseInt(process.env.WHOIS_RETRY_INTERVAL_MS || '600000', 10),
    rdapTimeoutMs: parseInt(process.env.WHOIS_RDAP_TIMEOUT_MS || '10000', 10),
    lookupTimeoutMs: parseInt(process.env.WHOIS_LOOKUP_TIMEOUT_MS || '15000', 10),
    bootstrapTimeoutMs: parseInt(process.env.WHOIS_BOOTSTRAP_TIMEOUT_MS || '5000', 10),
  },
  mistral: {
    timeoutMs: parseInt(process.env.MISTRAL_TIMEOUT_MS || '15000', 10),
    apiKey: process.env.MISTRAL_API_KEY || '',
    model: process.env.MISTRAL_MODEL || 'open-mistral-nemo',
    maxTokens: parseInt(process.env.MISTRAL_MAX_TOKENS || '200', 10),
  },
};
