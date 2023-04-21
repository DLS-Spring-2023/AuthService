import { Router } from 'express';
import bcrypt from 'bcrypt';
import {
	authenticateUser,
	loginUser,
	verifyProject
} from '../../../security/middleware/authentication.js';
import BodyParser from '../../../util/BodyParser.js';
import db from '../../../database/DatabaseGateway.js';
import { User } from '@prisma/client';
import { DbError } from '../../../util/enums.js';

const router = Router();

router.use(verifyProject);

/**
 * @openapi
 * /v1/user:
 *   post:
 *     summary: Create a new user
 *     parameters:
 *       - $ref: '#/components/parameters/API_KEY'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: An unknown error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - User
 */
router.post(
	'/',
	async (req, res, next) => {
		const parsedData = BodyParser.parseCreateUser(req.body);

		if (parsedData.error) {
			delete parsedData.error;
			res.status(400).send({ code: 400, message: 'Bad Request', errors: parsedData });
			return;
		}

		const { name, email, password } = parsedData;

		const user = await db.user.create({
			name,
			email: (email as string).toLowerCase(),
			password_hash: password,
			project_id: req.project.id
		} as User);

		// Test for insert error
		if (user.error && user.error === DbError.DUP_ENTRY) {
			res.status(409).send({ code: 409, message: 'Email already in use' });
			return;
		} else if (!user || user.error) {
			res.status(500).send({ code: 500, message: 'An unknown error occurred' });
			return;
		}

		req.auth = {
			accessToken: undefined as unknown as string,
			sessionToken: undefined as unknown as string,
			user: user as User
		};
		res.status(201);
		next();
	},
	loginUser
);

/**
 * @openapi
 * /v1/user/login:
 *   post:
 *     summary: Login a user
 *     parameters:
 *       - $ref: '#/components/parameters/API_KEY'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserRequest'
 *     responses:
 *       200:
 *         description: User logged in
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Email or password is incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: An unknown error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - User
 */
router.post(
	'/login',
	async (req, res, next) => {
		const { email, password } = req.body;

		if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
			res.status(400).send({ code: 400, message: 'Bad Request' });
			return;
		}

		const user = await db.user.findByEmail(email.toLowerCase());

		// Check for valid email and password
		if (!user || !(await bcrypt.compare(password, user.password_hash || ''))) {
			res.status(401).send({ code: 401, message: 'Email or password is incorrect' });
			return;
		}

		if (!user.enabled) {
			res.status(401).send({ code: 401, message: 'User is banned' });
			return;
		}
		
		req.auth = {
			accessToken: undefined as unknown as string,
			sessionToken: undefined as unknown as string,
			user
		};
		res.status(200);
		next();
	},
	loginUser
);

// ===== Protected route below this point ===== //
router.use(authenticateUser);

/**
 * @openapi
 * /v1/user:
 *   get:
 *     summary: Get user
 *     parameters:
 *       - $ref: '#/components/parameters/API_KEY'
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - User
 */
router.get('/', (req, res) => {
	res.send({ data: req.auth.user });
});

export default router;
