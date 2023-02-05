import { Router } from 'express';
import v1AccountRouter from './protected/AccountRouter.js';
import v1ProjectRouter from './protected/ProjectRouter.js';

const router = Router();

router.use('/account', v1AccountRouter);
router.use('/project', v1ProjectRouter);

export default router;