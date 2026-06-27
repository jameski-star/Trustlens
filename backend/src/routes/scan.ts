import { Router } from 'express';
import { scanUrl, scanEmail, scanSms, scanPhone, scanScreenshot, scanQrcode, getReport, downloadPdf, getRecentSearches, getTrendingScams } from '../controllers/scanController';
import { validate } from '../middleware/validate';
import { scanSchema } from '../validation/schemas';
import { scanLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/url', scanLimiter, scanUrl);
router.post('/email', scanLimiter, scanEmail);
router.post('/sms', scanLimiter, scanSms);
router.post('/phone', scanLimiter, scanPhone);
router.post('/screenshot', scanLimiter, scanScreenshot);
router.post('/qrcode', scanLimiter, scanQrcode);
router.get('/recent', getRecentSearches);
router.get('/trending', getTrendingScams);
router.get('/report/:shareId', getReport);
router.get('/report/:shareId/pdf', downloadPdf);

export default router;
