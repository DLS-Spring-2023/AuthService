import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../../../database/DatabaseGateway.js';
import { authenticateAccount } from '../../../security/middleware/authentication.js';
import BodyParser from '../../../util/BodyParser.js';
import { DbError } from '../../../util/enums.js';
import { Project } from '@prisma/client';

const router = Router();

router.use(authenticateAccount);

/**
 * @openapi
 * /v1/project:
 *   get:
 *     summary: Get Projects
 *     description: Retrieve all projects belonging to the authenticated account.
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
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
 *
 *     tags:
 *       - Project
 */
router.get('/', async (req, res) => {
	const projects = await db.project.findByAccountId(req.auth.user.id);
	res.send({ data: projects });
});

/**
 * @openapi
 * /v1/project/{id}:
 *   get:
 *     summary: Get Project by ID
 *     description: Retrieve a specific project by its ID if it belongs to the authenticated account.
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the project to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Project'
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
 *     tags:
 *       - Project
 */
router.get('/:id', async (req, res) => {
	const project = await db.project.findById(req.params.id);

	if (!project) {
		res.status(404).send({ code: 404, message: 'Not Found' });
		return;
	}

	if (project.account_id !== req.auth.user.id) {
		res.status(401).send({ code: 401, message: 'Unauthorized' });
		return;
	}

	res.send({ data: project });
});

/**
 * @openapi
 * /v1/project:
 *   post:
 *     summary: Create Project
 *     description: Create a new project belonging to the authenticated account.
 *     security:
 *       - Authorization: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - Project
 */
router.post('/', async (req, res) => {
	const { name } = req.body;

	if (!name || typeof name !== 'string') {
		res.status(400).send({ code: 400, message: 'Bad Request' });
		return;
	}

	const project = await db.project.create(name, req.auth.user.id);

	// Test for create error
	if (!project || !project.id) {
		res.status(500).send({ code: 500, message: 'Internal Error' });
		return;
	}

	res.send({ data: project });
});

/**
 * @openapi
 * /v1/project/{id}:
 *   put:
 *     summary: Update Project by ID
 *     description: Update a project with the specified ID if it belongs to the authenticated account.
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the project to update.
 *         schema:
 *           type: string
 *       - in: body
 *         name: project
 *         required: true
 *         description: The project data to update.
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Project'
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - Project
 */
router.put('/:id', async (req, res) => {
	const projectData = req.body.project as Project;

	if (!projectData) {
		res.status(400).send({ code: 400, message: 'Bad Request' });
		return;
	}

	const project = await db.project.findById(req.params.id);

	if (!project) {
		res.status(404).send({ code: 404, message: 'Not Found' });
		return;
	}

	if (project.account_id !== req.auth.user.id) {
		res.status(401).send({ code: 401, message: 'Unauthorized' });
		return;
	}

	if (projectData.name) project.name = projectData.name;

	const result = await db.project.update(project);

	// Test for insert error
	if (!result) {
		res.status(500).send({ code: 500, message: 'Internal Error' });
		return;
	}

	res.send({ data: result });
});

/**
 * @openapi
 * /v1/project/{id}:
 *   delete:
 *     summary: Delete Project by ID
 *     description: Delete a project with the specified ID if it belongs to the authenticated account.
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the project to delete.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No Content
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - Project
 */
router.delete('/:id', async (req, res) => {
	const project = await db.project.findById(req.params.id);

	if (!project) {
		res.status(404).send({ code: 404, message: 'Not Found' });
		return;
	}

	if (project.account_id !== req.auth.user.id) {
		res.status(401).send({ code: 401, message: 'Unauthorized' });
		return;
	}

	const success = await db.project.delete(project);

	const status = success ? 204 : 500;
	res.status(status).send();
});

// ===== Project Users ===== //

/**
 * @openapi
 * /v1/project/{project_id}/users:
 *   get:
 *     summary: Get Project Users
 *     description: Get all users associated with a project.
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: path
 *         name: project_id
 *         required: true
 *         description: ID of the project to get users for.
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     tags:
 *       - Project
 *
 */
router.get('/:id/users', async (req, res) => {
	const project = await db.project.findById(req.params.id);

	if (!project || !project.id) {
		res.status(404).send({ code: 404, message: 'Not Found' });
		return;
	}

	if (project.account_id !== req.auth.user.id) {
		res.status(401).send({ code: 401, message: 'Unauthorized' });
		return;
	}

	const users = await db.user.findByProjectId(project.id);

	for (const user of users) delete (user as { password_hash?: string }).password_hash;
	res.send({ data: users });
});

/**
 * @openapi
 * /v1/project/{project_id}/users/{user_id}:
 *   get:
 *     summary: Get Project User by ID
 *     description: Get a user associated with a project by ID.
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the project.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
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
 *     tags:
 *       - Project
 */
router.get('/:project_id/users/:user_id', async (req, res) => {
	const project = await db.project.findById(req.params.project_id);

	if (!project || !project.id) {
		res.status(404).send({ code: 404, message: 'Not Found' });
		return;
	}

	if (project.account_id !== req.auth.user.id) {
		res.status(401).send({ code: 401, message: 'Unauthorized' });
		return;
	}

	const user = await db.user.findById(req.params.user_id);

	if (!user || !user.id) {
		res.status(404).send({ code: 404, message: 'Not Found' });
		return;
	}

	delete (user as { password_hash?: string }).password_hash;
	res.send({ data: user });
});

/**
 * @openapi
 * /v1/project/{project_id}/users/{user_id}:
 *   put:
 *     summary: Edit project user
 *     description: Edit a user associated with the project identified by ID.
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: path
 *         name: project_id
 *         required: true
 *         description: ID of the project.
 *         schema:
 *           type: string
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID of the user.
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *                   enabled:
 *                     type: boolean
 *                   verified:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
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
 *       - Project
 */
router.put('/:project_id/users/:user_id', async (req, res) => {
	const project = await db.project.findById(req.params.project_id);

	if (!project || !project.id) {
		res.status(404).send({ code: 404, message: 'Not Found' });
		return;
	}

	// Check if user is authorized to access project
	if (project.account_id !== req.auth.user.id) {
		res.status(401).send({ code: 401, message: 'Unauthorized' });
		return;
	}

	const user = await db.user.findById(req.params.user_id);

	if (!user || !user.id) {
		res.status(404).send({ code: 404, message: 'Not Found' });
		return;
	}

	const userData = req.body.user;

	if (!userData) {
		res.status(400).send({ code: 400, message: 'Bad Request' });
		return;
	}

	// Update user data
	if (userData.name) user.name = userData.name;
	if (userData.email) user.email = userData.email;
	if (userData.password) user.password_hash = await bcrypt.hash(userData.password, 12);
	if (userData.enabled !== undefined) user.enabled = userData.enabled;
	if (userData.verified !== undefined) user.verified = userData.verified;

	// Validate user name
	if (userData.name && (typeof userData.name !== 'string' || userData.name.length < 2)) {
		res.status(400).send({ code: 400, message: 'Name must be longer than 2 characters' });
		return;
	}

	// Validate user email
	if (userData.email) {
		const result = BodyParser.parseEmail(userData.email);
		if (result.error) {
			console.log(result.message);

			res.status(400).send({ code: 400, message: result.message });
			return;
		}
	}

	// Validate user password
	if (
		userData.password &&
		(typeof userData.password !== 'string' ||
			userData.password.length < 6 ||
			userData.password.length > 64)
	) {
		res.status(400).send({
			code: 400,
			message: 'Password must be between 6 and 64 characters'
		});
		return;
	}

	// Validate user enabled
	if (userData.enabled && typeof userData.enabled !== 'boolean') {
		res.status(400).send({ code: 400, message: 'Enabled must be a boolean' });
		return;
	}

	// Validate user verified
	if (userData.verified && typeof userData.verified !== 'boolean') {
		res.status(400).send({ code: 400, message: 'Verified must be a boolean' });
		return;
	}

	const result = await db.user.update(user);

	// Test for insert error
	if (result.error && result.error === DbError.DUP_ENTRY) {
		res.status(409).send({ code: 409, message: 'Email already in use' });
		return;
	} else if (!result || result.error) {
		res.status(500).send({ code: 500, message: 'Internal Error' });
		return;
	}

	res.send({ data: result });
});

/**
 * @openapi
 * /v1/project/{project_id}/users/{user_id}:
 *   delete:
 *     summary: Delete Project User
 *     description: Delete a user associated with the project identified by ID.
 *     security:
 *       - Authorization: []
 *     parameters:
 *       - in: path
 *         name: project_id
 *         required: true
 *         description: ID of the project.
 *         schema:
 *           type: string
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: ID of the user.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No Content
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
 *     tags:
 *       - Project
 */
router.delete('/:project_id/users/:user_id', async (req, res) => {
	const project = await db.project.findById(req.params.project_id);

	if (!project || !project.id) {
		res.status(404).send({ code: 404, message: 'Not Found' });
		return;
	}

	if (project.account_id !== req.auth.user.id) {
		res.status(401).send({ code: 401, message: 'Unauthorized' });
		return;
	}

	const user = await db.user.findById(req.params.user_id);

	if (!user || !user.id) {
		res.status(404).send({ code: 404, message: 'Not Found' });
		return;
	}

	const success = await db.user.delete(user.id);
	const status = success ? 204 : 500;
	res.status(status).send();
});

export default router;
