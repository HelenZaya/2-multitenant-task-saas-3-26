import { prisma } from '../config/prisma.js';

export async function getDashboard(tenantId: string) {
  const [total, completed, overdue, tasksByStatus, tasksByPriority, users] = await Promise.all([
    prisma.task.count({ where: { tenantId } }),
    prisma.task.count({ where: { tenantId, status: 'DONE' } }),
    prisma.task.count({ where: { tenantId, dueDate: { lt: new Date() }, status: { not: 'DONE' } } }),
    prisma.task.groupBy({ by: ['status'], _count: true, where: { tenantId } }),
    prisma.task.groupBy({ by: ['priority'], _count: true, where: { tenantId } }),
    prisma.user.findMany({
      where: { tenantId },
      select: { id: true, name: true, _count: { select: { assignedTasks: true } } }
    })
  ]);
  return { total, completed, overdue, tasksByStatus, tasksByPriority, users };
}
