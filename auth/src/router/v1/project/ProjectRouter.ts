import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../../../database/DatabaseGateway.js';
import { authenticateAccount } from '../../../security/middleware/authentication.js';
import BodyParser from '../../../util/BodyParser.js';
import { DbError } from '../../../util/enums.js';
import { Project } from '@prisma/client';

const router = Router();

router.use(authenticateAccount);

// Get all personal projects (/v1/project)
router.post('/', async (req, res) => {
	const projects = await db.project.findByAccountId(req.auth.user.id);
	res.send({ data: projects });
});

// Create new project (/v1/project/create)
router.post('/create', async (req, res) => {
	const { name } = req.body;

	if (!name || typeof name !== 'string') {
		res.status(400).send({ code: 400, message: 'Bad Request' });
		return;
	}

	const project = await db.project.create(name, req.auth.user.id);

	// Test for create error
	if (!project || project.id) {
		res.status(500).send({ code: 500, message: 'Internal Error' });
		return;
	}

	res.send({ ...req.auth, data: project });
});

// Get project by id (/v1/project/:id/get)
router.post('/:id/get', async (req, res) => {
	const project = await db.project.findById(req.params.id);

	if (!project) {
		res.status(404).send({ code: 404, message: 'Not Found' });
		return;
	}

	if (project.account_id !== req.auth.user.id) {
		res.status(401).send({ code: 401, message: 'Unauthorized' });
		return;
	}

	res.send({ ...req.auth, data: project });
});

// Update project (/v1/project/:id)
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

	res.send({ ...req.auth });
});

// Delete project (/v1/project/:id)
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
	res.status(status).send({ ...req.auth });
});

// ===== Project Users ===== //

// Get project users (/v1/project/:id/users)
router.post('/:id/users', async (req, res) => {
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
	res.send({ ...req.auth, data: users });
});

// Find project user by ID (/v1/project/:project_id/users/:user_id)
router.post('/:project_id/users/:user_id', async (req, res) => {
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
	res.send({ ...req.auth, data: user });
});

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

	res.send({ ...req.auth });
});

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
	res.status(status).send({ ...req.auth });
});

export default router;
