import { Request, Response } from 'express';
import { getDashboard } from '../services/dashboard.service.js';
import { prisma } from '../config/prisma.js';

export async function stats(req: Request, res: Response) {
  const data = await getDashboard(req.auth!.tenantId);
  res.json(data);
}

export async function notifications(req: Request, res: Response) {
  const items = await prisma.notification.findMany({ where: { tenantId: req.auth!.tenantId, userId: req.auth!.userId }, orderBy: { createdAt: 'desc' }, take: 20 });
  res.json(items);
}

export async function billing(req: Request, res: Response) {
  const plan = await prisma.subscription.findFirst({ where: { tenantId: req.auth!.tenantId, active: true }, orderBy: { createdAt: 'desc' } });
  res.json(plan);
}
