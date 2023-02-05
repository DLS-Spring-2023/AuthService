import { Router } from 'express';
import v1PublicRoutes from './v1/public-routes.js';
import v1ProtectedRoutes from './v1/protected-routes.js';
import { authenticateAccount } from '../security/middleware/authentication.js';

const router = Router();

// v1
router.use('/v1', v1PublicRoutes);
router.use('/v1', authenticateAccount, /* TODO: Figure out user authentication */ v1ProtectedRoutes);

export default router;