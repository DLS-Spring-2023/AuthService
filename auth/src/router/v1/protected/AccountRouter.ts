import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../../../database/DatabaseGateway.js';
import JwtUtils from '../../../security/jwt/JwUtils.js';
import BodyParser from '../../../util/BodyParser.js';
import { DbError } from '../../../util/enums.js';
import { Account } from '../../../database/entity/Account.js';

const router = Router();

// Get Account (/v1/account)
router.post('/', (req, res) => {
    res.send({...req.auth})
});

// Update Account (/v1/account/update)
router.put('/update', async (req, res) => {
    const { name, email, oldPassword, newPassword } = req.body;

    const parsedData = BodyParser.parseUpdateAccount({name, email, oldPassword, newPassword });
    if (parsedData.error) {
        res.status(400).send(parsedData);
        return;
    }

    const account = await db.account.findById(req.auth.user.id);
    if (!account) {
        res.status(404).send({ code: 404, message: "Not Found" });
        return;
    }
    
    if (parsedData.name) account.name = name;
    if (parsedData.email) account.email = email;
    if (parsedData.newPassword) {
        const verified = await bcrypt.compare(parsedData.oldPassword, account.password_hash as string);
        if (!verified) {
            res.status(401).send({ error: true, oldPassword: "Password incorrect" });
            return;
        } else {
            account.password_hash = await bcrypt.hash(parsedData.newPassword, 12);
        }
    }

    const result = await db.account.update(account);

    // Test for insert error
    if (typeof result !== "boolean" && result.error && result.error === DbError.DUP_ENTRY) {
        res.status(409).send({ code: 409, message: "Email already in use" });
        return;
    } else if (!result || typeof result !== "boolean") {
        res.status(500).send({ code: 500, message: "Internal Error" });
        return;
    }

    req.auth.user.name = account.name as string;
    req.auth.user.email = account.email as string;
    res.send({ ...req.auth }); 
});

// Kill session (/v1/account/logout)
router.post('/logout', async (req, res) => {
    const { sessionToken } = req.auth;

    const decoded = JwtUtils.decodeToken(sessionToken);
    await db.accountSession.killSession(decoded.session_id);
    res.status(204).send();
});


// Delete account (/v1/account)
router.delete('/', async (req, res) => {
    const success = await db.account.delete({ id: req.auth.user.id } as Account);
    const status = success ? 204 : 500;
    const body = success ? { code: status, message: 'success' } : { code: status, message: 'operation failed' };
    res.status(status).send(body);
})

export default router;