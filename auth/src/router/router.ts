import { Router } from 'express';
import v1Router from './v1/router.js';

const router = Router();

router.use('/v1', v1Router);

router.get('/status', (req, res) => {
    res.status(200).send('OK');
});

export default router;
