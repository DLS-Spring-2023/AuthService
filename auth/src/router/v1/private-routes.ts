import { Router } from 'express';
import v1AccountRouter from './private/AccountRouter.js';
import v1ProjectRouter from './private/ProjectRouter.js';

const router = Router();

router.use('/account', v1AccountRouter);
router.use('/project', v1ProjectRouter);

export default router;