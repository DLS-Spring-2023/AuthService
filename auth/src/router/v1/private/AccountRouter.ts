import { Router } from 'express';
import db from '../../../database/DatabaseGateway.js';
import JwtUtils from '../../../security/jwt/JwUtils.js';

const router = Router();

// Get Account (/v1/account)
router.post('/', (req, res) => {
    // TODO:
    res.send({...req.auth})
});

// Change Password (/v1/account/update)
router.put('/update', (req, res) => {
    // TODO:
    res.send();
});

// Kill session (/v1/account/logout)
router.post('/logout', async (req, res) => {
    const { sessionToken } = req.auth;

    const decoded = JwtUtils.decodeToken(sessionToken);
    db.accountSession.killSession(decoded.session_id);
    res.status(204).send();
});

export default router;