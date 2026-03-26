import { prisma } from '../config/prisma.js';
import { io } from '../socket.js';

export async function createNotification(tenantId: string, userId: string, type: string, message: string) {
  const notification = await prisma.notification.create({
    data: { tenantId, userId, type, message }
  });
  io.to(`tenant:${tenantId}`).emit('notification.created', notification);
  return notification;
}
