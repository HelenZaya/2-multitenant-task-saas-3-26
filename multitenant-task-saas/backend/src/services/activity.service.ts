import { prisma } from '../config/prisma.js';

export async function logActivity(params: {
  tenantId: string;
  taskId?: string;
  userId?: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: unknown;
}) {
  return prisma.activityLog.create({ data: params });
}
