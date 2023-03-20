import { Router } from 'express';
import bcrypt from 'bcrypt';
import { authenticateUser, loginUser, verifyProject } from '../../../security/middleware/authentication.js';
import BodyParser from '../../../util/BodyParser.js';
import db from '../../../database/DatabaseGateway.js'
import { User } from '@prisma/client';
import { DbError } from '../../../util/enums.js';

const router = Router();

router.use(verifyProject);

router.post('/create', async (req, res, next) => {
    const parsedData = BodyParser.parseCreateUser(req.body); 
    
    if (parsedData.error) {
        delete parsedData.error;
        res.status(400).send({ code: 400, message: "Bad Request", errors: parsedData });
        return;
    }

    const { name, email, password } = parsedData;
    

    const user = await db.user.create({ name, email: email.toLowerCase(), password_hash: password, project_id: req.project.id } as User);
    
    // Test for insert error
    
    // @ts-ignore
    if (user.error && user.error === DbError.DUP_ENTRY) {
        res.status(409).send({ code: 409, message: "Email already in use" });
        return;
    // @ts-ignore
    } else if (!user || user.error) {
        res.status(500).send({ code: 500, message: "An unknown error occurred" });
        return;
    }
    
    req.body.user = user;
    res.status(201);
    next();
}, loginUser);

// Login (/v1/user/login)
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    if (
        !email    || typeof email !== "string"    ||
        !password || typeof password !== "string"
    ) {
        res.status(400).send({ code: 400, message: "Bad Request" });
        return;
    }

    const user = await db.user.findByEmail(email.toLowerCase());
    
    // Check for valid email and password
    if (!user || !await bcrypt.compare(password, user.password_hash || '')) {
        res.status(401).send({ code: 401, message: "Email or password is incorrect" });
        return;
    }

    if (!user.enabled) {
        res.status(401).send({ code: 401, message: "User is banned" });
        return;
    }

    req.body.user = user;
    res.status(200);
    next();

}, loginUser);

// ===== Protected route below this point ===== //
router.use(authenticateUser);

// Get user (/v1/account)
router.post('/', (req, res) => {
    res.send({...req.auth});
});


export default router;