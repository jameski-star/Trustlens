import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import {
  getDashboard, getUsers, moderateReports, updateReportStatus,
  createBlogPost, updateBlogPost, getAdminBlogPosts, getAnalytics,
} from '../controllers/adminController';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/reports/pending', moderateReports);
router.patch('/reports/:id/status', updateReportStatus);
router.get('/blog', getAdminBlogPosts);
router.post('/blog', createBlogPost);
router.put('/blog/:id', updateBlogPost);
router.get('/analytics', getAnalytics);

export default router;
