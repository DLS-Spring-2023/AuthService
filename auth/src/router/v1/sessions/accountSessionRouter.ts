import { Router } from 'express';
import { authenticateAccount } from '../../../security/middleware/authentication.js';
import db from '../../../database/DatabaseGateway.js';

const router = Router();

router.use(authenticateAccount);

/**
 * @openapi
 * /v1/session/account:
 *   get:
 *     summary: Get account sessions
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *      - Session (Account access)
 */
router.get('/', async (req, res) => {
	// get account sessions
	const sessions = await db.accountSession.findByUserId(req.auth.user.id);
	res.send({ data: sessions.map((session) => ({ ...session, id: session.id.toString() })) });
});

/**
 * @openapi
 * /v1/session/account/{session_id}:
 *   delete:
 *     summary: Delete account session
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: path
 *         name: session_id
 *         schema:
 *           type: string
 *           required: true
 *           description: Session ID
 *     responses:
 *       204:
 *         description: No content
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - Session (Account access)
 */
router.delete('/:session_id', async (req, res) => {
	// delete session
	if (!req.params.session_id) {
		return res.status(400).send({ error: 'Missing session ID' });
	}

	await db.accountSession.killSession(BigInt(req.params.session_id));
	res.status(204).send();
});

/**
 * @openapi
 * /v1/session/account/user/{session_id}:
 *   get:
 *     summary: Get user sessions
 *     security:
 *       - Authorization: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *      - Session (Account access)
 */
router.get('/user/:user_id', async (req, res) => {
	// get user sessions
	const sessions = await db.userSession.findByUserId(req.params.user_id);
	res.send({ data: sessions.map((session) => ({ ...session, id: session.id.toString() })) });
});

/**
 * @openapi
 * /v1/session/account/user/{session_id}:
 *   delete:
 *     summary: Delete user session
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: path
 *         name: session_id
 *         schema:
 *           type: string
 *           required: true
 *           description: Session ID
 *     responses:
 *       204:
 *         description: No content
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - Session (Account access)
 */
router.delete('/user/:session_id', async (req, res) => {
	// delete session
	await db.userSession.killSession(BigInt(req.params.session_id));
	res.status(204).send();
});

export default router;
