import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../../../database/DatabaseGateway.js';
import JwtUtils from '../../../security/jwt/JwUtils.js';
import BodyParser from '../../../util/BodyParser.js';
import { DbError } from '../../../util/enums.js';
import { authenticateAccount, loginAccount } from '../../../security/middleware/authentication.js';
import { Account } from '@prisma/client';

const router = Router();

// Create Account (/v1/account/create)
router.post(
	'/create',
	async (req, res, next) => {
		if (process.env.ALLOW_MULTIPLE_ACCOUNTS !== '1' && (await db.account.count()) > 1) {
			res.status(403).send({
				code: 403,
				message: 'Only one account can be registered at this time.'
			});
			return;
		}

		const parsedData = BodyParser.parseCreateUser(req.body);

		if (parsedData.error) {
			delete parsedData.error;
			res.status(400).send({ code: 400, message: 'Bad Request', errors: parsedData });
			return;
		}

		const { name, email, password } = parsedData;

		const account = await db.account.create({
			name,
			email: (email as string).toLowerCase(),
			password_hash: password
		} as Account);

		// Test for insert error
		if (account.error && account.error === DbError.DUP_ENTRY) {
			res.status(409).send({ code: 409, message: 'Email already in use' });
			return;
		} else if (!account || account.error) {
			res.status(500).send({ code: 500, message: 'Internal Error' });
			return;
		}

		req.body.account = account;
		res.status(201);
		next();
	},
	loginAccount
);

// Login (/v1/account/login)
router.post(
	'/login',
	async (req, res, next) => {
		const { email, password } = req.body;

		if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
			res.status(400).send({ code: 400, message: 'Bad Request' });
			return;
		}

		const account = await db.account.findByEmail(email.toLowerCase());

		// Check for valid email and password
		if (!account || !(await bcrypt.compare(password, account.password_hash || ''))) {
			res.status(401).send({ code: 401, message: 'Email or password is incorrect' });
			return;
		}

		req.body.account = account;
		res.status(200);
		next();
	},
	loginAccount
);

// ===== Protected route below this point ===== //
router.use(authenticateAccount);

// Get Account (/v1/account)
router.post('/', (req, res) => {
	res.send({ ...req.auth });
});

// Update Account (/v1/account/update)
router.put('/update', async (req, res) => {
	const { name, email, oldPassword, newPassword } = req.body;

	const parsedData = BodyParser.parseUpdateAccount({
		name,
		email,
		oldPassword,
		newPassword
	});
	if (parsedData.error) {
		res.status(400).send(parsedData);
		return;
	}

	const account = await db.account.findById(req.auth.user.id);
	if (!account) {
		res.status(404).send({ code: 404, message: 'Not Found' });
		return;
	}

	if (parsedData.name) account.name = name;
	if (parsedData.email) account.email = email;
	if (parsedData.newPassword) {
		const verified = await bcrypt.compare(
			parsedData.oldPassword as string,
			account.password_hash as string
		);
		if (!verified) {
			res.status(401).send({ error: true, oldPassword: 'Password incorrect' });
			return;
		} else {
			account.password_hash = await bcrypt.hash(parsedData.newPassword as string, 12);
		}
	}

	const result = await db.account.update(account);

	// Test and handle insert error
	if (result.error && result.error === DbError.DUP_ENTRY) {
		res.status(409).send({ code: 409, message: 'Email already in use' });
		return;
	} else if (!result || result.error) {
		res.status(500).send({ code: 500, message: 'Internal Error' });
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
	await db.accountSession.killSession(BigInt(decoded.session_id));
	res.status(204).send();
});

// Delete account (/v1/account)
router.delete('/', async (req, res) => {
	const success = await db.account.delete({ id: req.auth.user.id } as Account);
	const status = success ? 204 : 500;
	const body = success
		? { code: status, message: 'success' }
		: { code: status, message: 'operation failed' };
	res.status(status).send(body);
});

export default router;
