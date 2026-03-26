import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/boards/:boardId', taskController.getBoard);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.post('/:id/move', taskController.moveTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/comments', taskController.addComment);
export default router;
