import app from './app';
import { config } from './config';
import { connectDatabase } from './db/mongoose';
import { logger } from './utils/logger';
import { startScamAlertCron } from './services/scamAlertCron';

async function start(): Promise<void> {
  await connectDatabase();

  startScamAlertCron();

  app.listen(config.port, () => {
    logger.info(`TrustLens API running on port ${config.port} in ${config.env} mode`);
  });
}

start().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
