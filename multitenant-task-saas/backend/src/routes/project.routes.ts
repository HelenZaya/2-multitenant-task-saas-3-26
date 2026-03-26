import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', projectController.listProjects);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
export default router;
