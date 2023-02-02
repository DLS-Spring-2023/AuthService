import { Router } from 'express';
import v1AccountAuthRouter from './public/AccountAuthRouter.js';
import v1KeyRouter from './public/KeyRouter.js';

const router = Router();

router.use('/account', v1AccountAuthRouter);
router.use('/keys', v1KeyRouter);

export default router;