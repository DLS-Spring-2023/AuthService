import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../../../database/DatabaseGateway.js';
import JwtUtils from '../../../security/jwt/JwUtils.js';
import BodyParser from '../../../util/BodyParser.js';
import { DbError } from '../../../util/enums.js';
import { authenticateAccount, loginAccount } from '../../../security/middleware/authentication.js';
import { Account } from '@prisma/client';

const router = Router();

/**
 * @openapi
 * /v1/account:
 *   post:
 *     summary: Create a new account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - Account
 */
router.post(
	'/',
	async (req, res, next) => {
		if (process.env.ALLOW_MULTIPLE_ACCOUNTS !== '1' && (await db.account.count()) > 1) {
			return res.status(403).send({
				code: 403,
				message: 'Only one account can be registered at this time.'
			});
		}

		const parsedData = BodyParser.parseCreateUser(req.body);

		if (parsedData.error) {
			delete parsedData.error;
			return res.status(400).send({ code: 400, message: 'Bad Request', errors: parsedData });
		}

		const { name, email, password } = parsedData;

		const account = await db.account.create({
			name,
			email: (email as string).toLowerCase(),
			password_hash: password
		} as Account);

		// Test for insert error
		if (account.error && account.error === DbError.DUP_ENTRY) {
			return res.status(409).send({ code: 409, message: 'Email already in use' });
		} else if (!account || account.error) {
			return res.status(500).send({ code: 500, message: 'Internal Error' });
		}

		req.auth = {
			accessToken: undefined as unknown as string,
			sessionToken: undefined as unknown as string,
			user: account as Account
		};
		res.status(201);
		next();
	},
	loginAccount
);

/**
 * @openapi
 * /v1/account/login:
 *   post:
 *     summary: Log in to an account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserRequest'
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *     tags:
 *       - Account
 */
router.post(
	'/login',
	async (req, res, next) => {
		const { email, password } = req.body;

		if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
			return res.status(400).send({ code: 400, message: 'Bad Request' });
		}

		const account = await db.account.findByEmail(email.toLowerCase());

		// Check for valid email and password
		if (!account || !(await bcrypt.compare(password, account.password_hash || ''))) {
			return res.status(401).send({ code: 401, message: 'Email or password is incorrect' });
		}

		req.auth = {
			accessToken: undefined as unknown as string,
			sessionToken: undefined as unknown as string,
			user: account
		};
		res.status(200);
		next();
	},
	loginAccount
);

// ===== Protected route below this point ===== //
router.use(authenticateAccount);

/**
 * @openapi
 * /v1/account:
 *   get:
 *     summary: Get account information. Requires authentication.
 *     description: Get information about the authenticated account.
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *     tags:
 *       - Account
 */
router.get('/', (req, res) => {
	res.send({ data: req.auth.user });
});

/**
 * @openapi
 * /v1/account/update:
 *   put:
 *     summary: Update Account. Requires authentication.
 *     description: Update account with new name, email, or password. Each field is optional, but newPassword requires oldPassword.
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - Account
 */
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
	res.send({ ...req.auth.user });
});

/**
 * @openapi
 * /v1/account/logout:
 *   post:
 *     summary: Kill Session. Requires authentication.
 *     description: Kill user session by deleting the session from the database.
 *     security:
 *       - Authorization: []
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 code:
 *                   type: integer
 *     tags:
 *       - Account
 */
router.post('/logout', async (req, res) => {
	const { sessionToken } = req.auth;

	const decoded = JwtUtils.decodeToken(sessionToken);
	await db.accountSession.killSession(BigInt(decoded.session_id));

	res.clearCookie('access_token');
	res.clearCookie('session_token');
	res.removeHeader('Authorization');
	res.status(204).send();
});

/**
 * @openapi
 * /v1/account:
 *   delete:
 *     summary: Delete Account. Requires authentication.
 *     description: Delete user account from the database.
 *     security:
 *       - Authorization: []
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - Account
 */
router.delete('/', async (req, res) => {
	const success = await db.account.delete({ id: req.auth.user.id } as Account);
	const status = success ? 204 : 500;
	const body = success ? undefined : { code: status, message: 'operation failed' };

	res.clearCookie('access_token');
	res.clearCookie('session_token');
	res.removeHeader('Authorization');
	res.status(status).send(body);
});

export default router;
