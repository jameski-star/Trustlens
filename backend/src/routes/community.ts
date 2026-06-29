import { Router } from 'express';
import { createReport, getReports, getReportById, upvoteReport, downvoteReport, getReportStats } from '../controllers/communityController';
import { validate } from '../middleware/validate';
import { communityReportSchema } from '../validation/schemas';
import { uploadScreenshots } from '../middleware/upload';

const router = Router();

router.get('/', getReports);
router.get('/stats', getReportStats);
router.get('/:id', getReportById);
router.post('/', uploadScreenshots.array('screenshots', 5), validate(communityReportSchema), createReport);
router.post('/:id/upvote', upvoteReport);
router.post('/:id/downvote', downvoteReport);

export default router;
