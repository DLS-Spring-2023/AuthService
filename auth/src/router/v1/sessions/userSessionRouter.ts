import { Router } from 'express';
import { authenticateUser } from '../../../security/middleware/authentication.js';
import db from '../../../database/DatabaseGateway.js';

const router = Router();

router.use(authenticateUser)

// get user sessions (/session/user)
router.post('/', async (req, res) => {
    // get user sessions
    const sessions = await db.userSession.findByUserId(req.auth.user.id);
    res.send(JSON.stringify(sessions, (_, value) => typeof value === 'bigint' ? value.toString() : value));
});

// delete user session (/session/user/:session_id)
router.delete('/:session_id', async (req, res) => {
    // delete session
    await db.userSession.killSession(BigInt(req.params.session_id));
    res.status(204).send();
});

export default router;