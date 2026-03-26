import { Router } from 'express';
import * as workspaceController from '../controllers/workspace.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { Role } from '@prisma/client';

const router = Router();
router.get('/me', requireAuth, workspaceController.getWorkspace);
router.post('/invite', requireAuth, requireRole(Role.TENANT_ADMIN, Role.SUPER_ADMIN, Role.PROJECT_MANAGER), workspaceController.inviteMember);
export default router;
