import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { createNotification } from '../services/notification.service.js';

const inviteSchema = z.object({ name: z.string().min(2), email: z.string().email(), role: z.nativeEnum(Role) });

export async function getWorkspace(req: Request, res: Response) {
  const tenantId = req.auth!.tenantId;
  const workspace = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    include: {
      users: { include: { memberships: true } },
      subscriptions: true,
      projects: { where: { archived: false } }
    }
  });
  res.json(workspace);
}

export async function inviteMember(req: Request, res: Response) {
  const tenantId = req.auth!.tenantId;
  const data = inviteSchema.parse(req.body);
  const passwordHash = await bcrypt.hash('Welcome123!', 10);
  const user = await prisma.user.create({
    data: {
      tenantId,
      name: data.name,
      email: data.email,
      passwordHash,
      memberships: { create: { tenantId, role: data.role } }
    },
    include: { memberships: true }
  });
  await createNotification(tenantId, user.id, 'invited', `You were invited to ${tenantId}`);
  res.json(user);
}
