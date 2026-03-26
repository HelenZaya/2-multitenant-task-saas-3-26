import { Router } from 'express';
import authRoutes from './auth.routes.js';
import workspaceRoutes from './workspace.routes.js';
import projectRoutes from './project.routes.js';
import taskRoutes from './task.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import { prisma } from '../config/prisma.js';

const router = Router();
router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);
router.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true });
});
router.get('/metrics', async (_req, res) => {
  const users = await prisma.user.count();
  const tasks = await prisma.task.count();
  res.type('text/plain').send(`app_users ${users}\napp_tasks ${tasks}`);
});
export default router;
