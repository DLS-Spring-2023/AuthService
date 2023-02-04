import { Router } from 'express';
import db from '../../../database/DatabaseGateway.js';

const router = Router();

// Get all personal projects (/v1/project)
router.post('/', async (req, res) => {
    const projects = await db.project.findByAccountId(req.auth.user.id);
    res.send({ data: projects });
});

// Get project by id (/v1/project/:id)
router.post('/get/:id', async (req, res) => {
    const project = await db.project.findById(req.params.id);
    
    if (!project) {
        res.status(404).send({ code: 404, message: "Not Found" });
        return;
    }

    // An account can only access projects if they are a member of the relevant organization
    const canAccess = await db.organization.isMember(req.auth.user.id, project.organization_id);
    if (!canAccess) {
        res.status(401).send({ code: 401, message: "Unauthorized" });
        return;
    }

    res.send(project);
});

// Create new project (/v1/project/create)
router.post('/create', async (req, res) => {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
        res.status(400).send({ code: 400, message: "Bad Request" });
        return;
    }

    const project = await db.project.create(name, req.auth.user.id);

    // Test for create error
    if (!project || project.error) {
        res.status(500).send({ code: 500, message: "Internal Error" });
        return;
    }

    res.send({...req.auth, data: project});
});

export default router;