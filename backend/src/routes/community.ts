import { Router } from 'express';
import { createReport, getReports, getReportById, upvoteReport, getReportStats } from '../controllers/communityController';
import { validate } from '../middleware/validate';
import { communityReportSchema } from '../validation/schemas';
import { uploadScreenshots } from '../middleware/upload';

const router = Router();

router.get('/', getReports);
router.get('/stats', getReportStats);
router.get('/:id', getReportById);
router.post('/', uploadScreenshots.array('screenshots', 5), validate(communityReportSchema), createReport);
router.patch('/:id/upvote', upvoteReport);

export default router;
