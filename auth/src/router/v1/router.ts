import { Router } from 'express';
import keyRouter from './keys/KeyRouter.js';
import accountRouter from './account/AccountRouter.js';
import projectRouter from './project/ProjectRouter.js';
import userAuthRouter from './user/UserRouter.js';
import accountSessionRouter from './sessions/accountSessionRouter.js';
import userSessionRouter from './sessions/userSessionRouter.js';
import swaggerRouter from './swagger/swaggerRouter.js';

const router = Router();

router.use('/keys', keyRouter);
router.use('/account', accountRouter);
router.use('/project', projectRouter);
router.use('/user', userAuthRouter);
router.use('/session/account', accountSessionRouter);
router.use('/session/user', userSessionRouter);
router.use('/docs', swaggerRouter);

export default router;
