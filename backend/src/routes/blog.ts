import { Router } from 'express';
import { getPosts, getPostBySlug, getCategories, getComments, createComment } from '../controllers/blogController';

const router = Router();

router.get('/', getPosts);
router.get('/categories', getCategories);
router.get('/:slug', getPostBySlug);
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', createComment);

export default router;
