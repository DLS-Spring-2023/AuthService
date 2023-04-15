import { Router } from 'express';
import { authenticateAccount } from '../../../security/middleware/authentication.js';
import db from '../../../database/DatabaseGateway.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         id: 
 *           type: string
 *         user_id:
 *           type: string
 *         created_at:
 *           type: string
 *         ip:
 *           type: string
 *         os:
 *           type: string
 *         browser:
 *           type: string
 *         location:
 *           type: string
 */

const router = Router();

router.use(authenticateAccount);

/**
 * @openapi
 * /v1/session/account:
 *   post:
 *     summary: Get account sessions
 *     security:
 *      - AccountAccessToken: []
 *        AccountSessionToken: []
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
router.post('/', async (req, res) => {
    // get account sessions
    const sessions = await db.accountSession.findByUserId(req.auth.user.id);
    res.send({ data: sessions.map(session => ({...session, id: session.id.toString()})) });
});

/**
 * @openapi
 * /v1/session/account/{session_id}:
 *   delete:
 *     summary: Delete account session
 *     security:
 *       - AccountAccessToken: []
 *         AccountSessionToken: []
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
// delete account session (/session/account/:session_id)
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
 *   post:
 *     summary: Get user sessions
 *     security:
 *      - AccountAccessToken: []
 *        AccountSessionToken: []
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
// get user sessions (/session/user/:user_id)
router.post('/user/:user_id', async (req, res) => {
    // get user sessions
    const sessions = await db.userSession.findByUserId(req.params.user_id);
    res.send({ data: sessions.map(session => ({...session, id: session.id.toString()})) });
});


/**
 * @openapi
 * /v1/session/account/user/{session_id}:
 *   delete:
 *     summary: Delete user session
 *     security:
 *       - AccessToken: []
 *         SessionToken: []
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
// delete user session (/session/user/:session_id)
router.delete('/user/:session_id', async (req, res) => {
    // delete session
    await db.userSession.killSession(BigInt(req.params.session_id));
    res.status(204).send();
});


export default router;