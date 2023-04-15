import { Router } from 'express';
import JwtUtils from '../../../security/jwt/JwUtils.js';
import db from '../../../database/DatabaseGateway.js';


const router = Router();

/**
 * @openapi
 * /v1/keys/account:
 *   get:
 *     summary: Retrieve the public key used to validate account access tokens
 *     responses:
 *       200:
 *         description: The public key for accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicKey:
 *                       type: string
 *     tags:
 *       - Keys
 */
router.get('/account', async (_, res) => {
	const key = await db.accountKeystore.find('public');
	res.send({ data: {
		publicKey: key?.toString()
	}});
});

/**
 * @openapi
 * /v1/keys/project/{project_id}:
 *   get:
 *     summary: Retrieve the public key for a project, used to validate user access tokens for the project users
 *     parameters:
 *       - in: path
 *         name: project_id
 *         required: true
 *         description: The ID of the project
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The public key for the project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     publicKey:
 *                       type: string
 *     tags:
 *       - Keys
 */
router.get('/project/:project_id', async (req, res) => {
	const projectId = req.params.project_id;
	const key = await db.projectKeystore.find('public', projectId);
	res.send({ data: {
		publicKey: key?.toString()
	}});
});

export default router;
