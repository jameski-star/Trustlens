import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from '../utils/logger';

export async function connectDatabase(): Promise<void> {
  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB error');
  });
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });

  if (!config.mongodbUri || config.mongodbUri.includes('<username>')) {
    logger.warn('MongoDB URI not configured — running without database');
    return;
  }

  try {
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 8000,
      heartbeatFrequencyMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority',
    });
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection error');
    if (config.env === 'production') {
      process.exit(1);
    }
  }
}
