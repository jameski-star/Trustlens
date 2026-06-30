import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config';
import { logger } from './utils/logger';
import { helmetMiddleware, sanitizeMiddleware, xssClean } from './middleware/sanitize';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes/index';

const app = express();

app.set('trust proxy', 1);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api/v1')) {
      logger.info({ method: req.method, path: req.path, status: res.statusCode, duration: `${duration}ms` }, 'Request');
    }
  });
  next();
});

app.use(helmetMiddleware);
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = config.cors.origin;
    if (allowed.includes('*')) return callback(null, true);
    const cleaned = origin.replace(/\/+$/, '');
    const match = allowed.includes(cleaned) ||
      allowed.some(a => cleaned.endsWith('.' + a.replace(/^https?:\/\//, '')) || cleaned === a.replace(/^https?:\/\//, ''));
    callback(null, match);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);
app.use(xssClean);
app.use(generalLimiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/v1', apiRoutes);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'TrustLens API',
    version: '1.0.0',
    docs: '/api/v1/health',
  });
});

app.get('/api/v1/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use(errorHandler);

export default app;
