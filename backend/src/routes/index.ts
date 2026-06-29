import { Router } from 'express';
import scanRoutes from './scan';
import authRoutes from './auth';
import reportRoutes from './report';
import communityRoutes from './community';
import blogRoutes from './blog';
import adminRoutes from './admin';
import contactRoutes from './contact';
import knowledgeRoutes from './knowledge';

const router = Router();

router.use('/scan', scanRoutes);
router.use('/auth', authRoutes);
router.use('/report', reportRoutes);
router.use('/community', communityRoutes);
router.use('/blog', blogRoutes);
router.use('/admin', adminRoutes);
router.use('/contact', contactRoutes);
router.use('/knowledge', knowledgeRoutes);

export default router;
