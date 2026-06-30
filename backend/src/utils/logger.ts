import pino from 'pino';
import { config } from '../config';

let transportOpts: Record<string, unknown> | undefined;
try {
  transportOpts = { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } } };
} catch { /* pino-pretty not installed */ }

export const logger = pino({
  name: 'trustlens',
  level: config.env === 'production' ? 'info' : 'debug',
  ...(config.env !== 'production' && transportOpts ? transportOpts : {}),
  redact: ['req.headers.authorization', 'req.body.password'],
});
