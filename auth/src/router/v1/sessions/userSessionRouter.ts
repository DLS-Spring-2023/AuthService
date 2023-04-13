import { Router } from 'express';
import { authenticateUser } from '../../../security/middleware/authentication.js';

const router = Router();

router.use(authenticateUser)

export default router;