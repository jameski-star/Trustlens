import { Router } from 'express';
import { submitContact } from '../controllers/contactController';
import { validate } from '../middleware/validate';
import { contactSchema } from '../validation/schemas';

const router = Router();

router.post('/', validate(contactSchema), submitContact);

export default router;
