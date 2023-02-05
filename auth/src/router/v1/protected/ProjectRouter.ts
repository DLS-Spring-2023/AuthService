import { Router } from 'express';
import db from '../../../database/DatabaseGateway.js';
import { Project } from '../../../database/entity/Project.js';
import RSA from '../../../security/keygen/RSA.js';

const router = Router();

// Get all personal projects (/v1/project)
router.post('/', async (req, res) => {
    const projects = await db.project.findByAccountId(req.auth.user.id);
    res.send({ data: projects });
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
    if (!(project instanceof Project) || !project.id) {
        res.status(500).send({ code: 500, message: "Internal Error" });
        return;
    }

    const key = new RSA(project.id);
    key.generate();
    await key.save();

    res.send({...req.auth, data: project});
});

// Get project by id (/v1/project/:id/get)
router.post('/:id/get', async (req, res) => {
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


// Update project (/v1/project/:id)
router.put('/:id', async (req, res) => {

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
    if (!result || (typeof result !== "boolean" && result.error)) {
        res.status(500).send({ code: 500, message: "Internal Error" });
        return;
    }

    res.send({...req.auth })
});


// Delete project (/v1/project/:id)
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

    const success = await db.project.delete(project);

    const keystore = new RSA(project.id as string);
    keystore.deleteKey();

    const status = success ? 204 : 500;
    const body = success ? { code: status, message: 'success' } : { code: status, message: 'operation failed' };
    res.send({...req.auth });
});

export default router;