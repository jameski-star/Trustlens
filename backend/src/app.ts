import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { helmetMiddleware, sanitizeMiddleware, xssClean } from './middleware/sanitize';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import scanRoutes from './routes/scan';
import authRoutes from './routes/auth';
import communityRoutes from './routes/community';
import blogRoutes from './routes/blog';
import adminRoutes from './routes/admin';
import contactRoutes from './routes/contact';
import { logger } from './utils/logger';

const app = express();

app.use(helmetMiddleware);
app.use(cors({
  origin: config.cors.origin,
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

app.use('/api/v1/scan', scanRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/blog', blogRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/contact', contactRoutes);

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
