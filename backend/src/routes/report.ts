import { Router } from 'express';
import { getReport, downloadPdf } from '../controllers/reportController';

const router = Router();

router.get('/:shareId', getReport);
router.get('/:shareId/pdf', downloadPdf);

export default router;
