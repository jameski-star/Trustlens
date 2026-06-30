import app from './app';
import { config } from './config';
import { connectDatabase } from './db/mongoose';
import { logger } from './utils/logger';
import { startScamAlertCron } from './services/scamAlertCron';
import fs from 'fs';
import path from 'path';

process.on('uncaughtException', (err) => {
  try { logger.fatal({ err }, 'Uncaught exception'); } catch {}
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  try { logger.error({ err: reason }, 'Unhandled rejection'); } catch {}
  console.error('UNHANDLED REJECTION:', reason);
});

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const UPLOAD_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function startUploadCleanup(): void {
  setInterval(() => {
    fs.readdir(UPLOADS_DIR, (err, files) => {
      if (err) return;
      const now = Date.now();
      for (const file of files) {
        const filePath = path.join(UPLOADS_DIR, file);
        try {
          const stat = fs.statSync(filePath);
          if (now - stat.mtimeMs > UPLOAD_MAX_AGE_MS) {
            fs.unlinkSync(filePath);
          }
        } catch {}
      }
    });
  }, 3600_000);
}

async function start(): Promise<void> {
  await connectDatabase();

  startScamAlertCron();
  startUploadCleanup();

  app.listen(config.port, () => {
    logger.info(`TrustLens API running on port ${config.port} in ${config.env} mode`);
  });
}

start().catch((error) => {
  try { logger.error({ err: error }, 'Failed to start server'); } catch {}
  console.error('Failed to start server:', error instanceof Error ? error.message : error);
  console.error(error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
