import { Router } from 'express';
import { authenticateUser, verifyProject } from '../../../security/middleware/authentication.js';
import db from '../../../database/DatabaseGateway.js';

const router = Router();

router.use(authenticateUser, verifyProject);

/**
 * @openapi
 * /v1/session/user:
 *   get:
 *     summary: Get user's sessions
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - $ref: '#/components/parameters/API_KEY'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Session'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - Session (User access)
 */
router.get('/', async (req, res) => {
	// get user sessions
	const sessions = await db.userSession.findByUserId(req.auth.user.id);
	res.send({ data: sessions.map((session) => ({ ...session, id: session.id.toString() })) });
});

/**
 * @openapi
 * /v1/session/user/{session_id}:
 *   delete:
 *     summary: Delete user session
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - $ref: '#/components/parameters/API_KEY'
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - Session (User access)
 */
router.delete('/:session_id', async (req, res) => {
	// delete session
	await db.userSession.killSession(BigInt(req.params.session_id));
	res.status(204).send();
});

export default router;
