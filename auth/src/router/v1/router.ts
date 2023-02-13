import { Router } from 'express';
import keyRouter from './keys/KeyRouter.js';
import accountRouter from './account/AccountRouter.js';
import projectRouter from './project/ProjectRouter.js';
import userAuthRouter from './user/UserRouter.js';

const router = Router();

router.use('/keys', keyRouter);
router.use('/account', accountRouter);
router.use('/project', projectRouter);
router.use('/user', userAuthRouter);

export default router;