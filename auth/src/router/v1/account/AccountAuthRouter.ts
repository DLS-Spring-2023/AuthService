// import { Request, Response, Router } from 'express';
// import bcrypt from 'bcrypt';
// import db from '../../../database/DatabaseGateway.js';
// import { AccountJWT } from '../../../security/jwt/JWT.js';
// import { DbError } from '../../../util/enums.js';
// import { Account } from '../../../database/entity/Account.js';

// const router = Router();

// // Create Account (/v1/account/create)
// router.post('/create', async (req, res, next) => {

//     if (process.env.ALLOW_MULTIPLE_ACCOUNTS !== '1' && await db.account.count() > 1) {
//         res.status(403).send({ code: 403, message: "Only one account can be registered at this time." });
//         return;
//     }

//     const { name, password, email } = req.body;

//     if (
//         !name     || typeof name !== "string"     ||
//         !email    || typeof email !== "string"    ||
//         !password || typeof password !== "string"
//     ) {
//         res.status(400).send({ code: 400, message: "Bad Request" });
//         return;
//     }

//     // Test for valid email address
//     const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     if (!pattern.test(String(email.toLowerCase()))) {
//         res.status(400).send({ code: 400, message: "Invalid email address" });
//         return;
//     }

//     const account = await db.account.insert({ name, email: email.toLowerCase(), password_hash: password } as Account);

//     // Test for insert error
//     if (!(account instanceof Account) && account.error && account.error === DbError.DUP_ENTRY) {
//         res.status(409).send({ code: 409, message: "Email already in use" });
//         return;
//     } else if (!account || (!(account instanceof Account) && account.error)) {
//         res.status(500).send({ code: 500, message: "Internal Error" });
//         return;
//     }

//     req.body.account = account;
//     res.status(201);
//     next();

// }, login);

// // Login (/v1/account/login)
// router.post('/login', async (req, res, next) => {
//     const { email, password } = req.body;

//     if (
//         !email    || typeof email !== "string"    ||
//         !password || typeof password !== "string"
//     ) {
//         res.status(400).send({ code: 400, message: "Bad Request" });
//         return;
//     }

//     const account = await db.account.findByEmail(email.toLowerCase());

//     // Check for valid email and password
//     if (!account || !await bcrypt.compare(password, account.password_hash || '')) {
//         res.status(401).send({ code: 401, message: "Email or password is incorrect" });
//         return;
//     }

//     req.body.account = account;
//     res.status(200);
//     next();

// }, login);

// async function login (req: Request, res: Response) {
//     const account_id = req.body.account.id;

//     const session = await AccountJWT.signNewSessionToken(account_id);

//     if (!session) {
//         res.status(500).send({ code: 500, message: "Internal Error" });
//         return;
//     }

//     const accessToken = await AccountJWT.signAccessToken(account_id, session?.session_id);

//     res.cookie('account_access_token', accessToken, {
//         maxAge: 1000 * 60 * 15 - 10,
//         httpOnly: true,
//         secure: false, // TODO
//         path: '/',
//         sameSite: 'lax'
//     });

//     res.cookie('account_session_token', session.token, {
//         maxAge: 1000 * 60 * 60 * 24 * 365 - 1000 * 10,
//         httpOnly: true,
//         secure: false, // TODO
//         path: '/',
//         sameSite: 'lax'
//     });

//     // Response
//     res.send({
//         accessToken: accessToken,
//         sessionToken: session.token
//     });
// }

// export default router;
