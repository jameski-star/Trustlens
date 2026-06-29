import { Router } from 'express';
import { getPosts, getPostBySlug, getCategories } from '../controllers/blogController';

const router = Router();

router.get('/', getPosts);
router.get('/categories', getCategories);
router.get('/:slug', getPostBySlug);

export default router;
