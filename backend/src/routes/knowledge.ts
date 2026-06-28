import { Router } from 'express';
import { getArticles, getArticleBySlug } from '../controllers/knowledgeController';

const router = Router();

router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);

export default router;
