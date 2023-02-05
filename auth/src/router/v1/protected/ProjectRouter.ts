import { Router } from 'express';
import db from '../../../database/DatabaseGateway.js';
import { Project } from '../../../database/entity/Project.js';

const router = Router();

// Get all personal projects (/v1/project)
router.post('/', async (req, res) => {
    const projects = await db.project.findByAccountId(req.auth.user.id);
    res.send({ data: projects });
});

// Get project by id (/v1/project/get/:id)
router.post('/get/:id', async (req, res) => {
    const project = await db.project.findById(req.params.id);
    
    if (!project) {
        res.status(404).send({ code: 404, message: "Not Found" });
        return;
    }
    
    if (project.account_id !== req.auth.user.id) {
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

router.put('/update/:id', async (req, res) => {

    const projectData = req.body.project as Project;

    if (!projectData) {
        res.status(400).send({ code: 400, message: "Bad Request" });
        return;
    }

    const project = await db.project.findById(req.params.id);

    if (!project) {
        res.status(404).send({ code: 404, message: "Not Found" });
        return;
    }

    if (project.account_id !== req.auth.user.id) {
        res.status(401).send({ code: 401, message: "Unauthorized" });
        return;
    }

    if (projectData.name) project.name = projectData.name;

    const result = await db.project.update(project);

    // Test for insert error
    if (!result || result.error) {
        res.status(500).send({ code: 500, message: "Internal Error" });
        return;
    }

    res.send({...req.auth })
});

router.delete('/:id', async (req, res) => {

    const project = await db.project.findById(req.params.id);

    if (!project) {
        res.status(404).send({ code: 404, message: "Not Found" });
        return;
    }

    if (project.account_id !== req.auth.user.id) {
        res.status(401).send({ code: 401, message: "Unauthorized" });
        return;
    }

    await db.project.delete(project);
    res.send({...req.auth });
});

export default router;