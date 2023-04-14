import { Router } from 'express';
import { authenticateAccount } from '../../../security/middleware/authentication.js';
import db from '../../../database/DatabaseGateway.js';

const router = Router();

router.use(authenticateAccount);

// get account sessions (/session/account)
router.post('/', async (req, res) => {
    // get account sessions
    const sessions = await db.accountSession.findByUserId(req.auth.user.id);
    res.send(JSON.stringify(sessions, (_, value) => typeof value === 'bigint' ? value.toString() : value));
});

// get user sessions (/session/user/:user_id)
router.post('/user/:user_id', async (req, res) => {
    // get user sessions
    const sessions = await db.userSession.findByUserId(req.params.user_id);
    res.send(JSON.stringify(sessions, (_, value) => typeof value === 'bigint' ? value.toString() : value));
});

// delete account session (/session/account/:session_id)
router.delete('/:session_id', async (req, res) => {
    // delete session
    await db.accountSession.killSession(BigInt(req.params.session_id));
    res.status(204).send();
});

// delete user session (/session/user/:session_id)
router.delete('/user/:session_id', async (req, res) => {
    // delete session
    await db.userSession.killSession(BigInt(req.params.session_id));
    res.status(204).send();
});


export default router;