import { Router } from 'express';
import { authenticateAccount } from '../../../security/middleware/authentication.js';
import db from '../../../database/DatabaseGateway.js';

const router = Router();

router.use(authenticateAccount);

router.post('/', async (req, res) => {
    // get account sessions
    const sessions = await db.accountSession.findByUserId(req.auth.user.id);
    res.send(JSON.stringify(sessions, (_, value) => typeof value === 'bigint' ? value.toString() : value));
});

export default router;