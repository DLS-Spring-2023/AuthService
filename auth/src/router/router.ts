import { Router } from 'express';
import v1PublicRoutes from './v1/public-routes.js';
import v1PrivateRoutes from './v1/private-routes.js';
import { authenticateAccount } from '../security/middleware.js';

const router = Router();

// v1
router.use('/v1', v1PublicRoutes);
router.use('/v1', authenticateAccount, /* TODO: Figure out user authentication */ v1PrivateRoutes);

export default router;