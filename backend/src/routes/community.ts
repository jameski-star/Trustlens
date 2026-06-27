import { Router } from 'express';
import { createReport, getReports, upvoteReport, getReportStats } from '../controllers/communityController';
import { validate } from '../middleware/validate';
import { communityReportSchema } from '../validation/schemas';

const router = Router();

router.get('/', getReports);
router.get('/stats', getReportStats);
router.post('/', validate(communityReportSchema), createReport);
router.patch('/:id/upvote', upvoteReport);

export default router;
