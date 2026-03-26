import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/stats', dashboardController.stats);
router.get('/notifications', dashboardController.notifications);
router.get('/billing/plan', dashboardController.billing);
export default router;
