import { Router } from 'express';
import { scanUrl, scanEmail, scanSms, scanPhone, scanScreenshot, scanQrcode, getRecentSearches, getTrendingScams } from '../controllers/scanController';
import { scanLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { scanSchema } from '../validation/schemas';

const router = Router();

router.post('/url', scanLimiter, validate(scanSchema), scanUrl);
router.post('/email', scanLimiter, validate(scanSchema), scanEmail);
router.post('/sms', scanLimiter, validate(scanSchema), scanSms);
router.post('/phone', scanLimiter, validate(scanSchema), scanPhone);
router.post('/screenshot', scanLimiter, scanScreenshot);
router.post('/qrcode', scanLimiter, scanQrcode);
router.get('/recent', getRecentSearches);
router.get('/trending', getTrendingScams);

export default router;
