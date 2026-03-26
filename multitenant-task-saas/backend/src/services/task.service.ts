import { Priority, TaskStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { getNewPosition } from '../utils/position.js';
import { logActivity } from './activity.service.js';
import { createNotification } from './notification.service.js';
import { io } from '../socket.js';

export async function listBoard(tenantId: string, boardId: string) {
  return prisma.board.findFirstOrThrow({
    where: { id: boardId, tenantId },
    include: {
      project: true,
      columns: { orderBy: { position: 'asc' } },
      tasks: {
        orderBy: { position: 'asc' },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          comments: { include: { user: { select: { name: true, id: true } } }, orderBy: { createdAt: 'asc' } },
          activityLogs: { orderBy: { createdAt: 'desc' }, take: 10 }
        }
      }
    }
  });
}

export async function createTask(tenantId: string, userId: string, data: {
  boardId: string; projectId: string; columnId: string; title: string; description?: string; assigneeId?: string; dueDate?: string; priority?: Priority; labels?: string[];
}) {
  const lastTask = await prisma.task.findFirst({ where: { tenantId, columnId: data.columnId }, orderBy: { position: 'desc' } });
  const task = await prisma.task.create({
    data: {
      tenantId,
      projectId: data.projectId,
      boardId: data.boardId,
      columnId: data.columnId,
      title: data.title,
      description: data.description,
      assigneeId: data.assigneeId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      priority: data.priority ?? Priority.MEDIUM,
      status: TaskStatus.TODO,
      labels: data.labels ?? [],
      position: getNewPosition(lastTask?.position, null)
    },
    include: { assignee: { select: { id: true, name: true } } }
  });
  await logActivity({ tenantId, taskId: task.id, userId, entityType: 'task', entityId: task.id, action: 'task.created' });
  if (task.assigneeId) await createNotification(tenantId, task.assigneeId, 'task_assigned', `Assigned to task: ${task.title}`);
  io.to(`tenant:${tenantId}`).emit('task.created', task);
  return task;
}

export async function updateTask(tenantId: string, userId: string, taskId: string, data: Partial<{ title: string; description: string; assigneeId: string; dueDate: string | null; priority: Priority; status: TaskStatus; labels: string[] }>) {
  await prisma.task.findFirstOrThrow({ where: { id: taskId, tenantId } });
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...data,
      dueDate: data.dueDate === undefined ? undefined : data.dueDate ? new Date(data.dueDate) : null
    },
    include: { assignee: { select: { id: true, name: true } }, comments: true, activityLogs: true }
  });
  await logActivity({ tenantId, taskId, userId, entityType: 'task', entityId: taskId, action: 'task.updated', metadata: data });
  io.to(`tenant:${tenantId}`).emit('task.updated', task);
  return task;
}

export async function moveTask(tenantId: string, userId: string, params: { taskId: string; toColumnId: string; prevPosition?: number | null; nextPosition?: number | null; }) {
  const newPosition = getNewPosition(params.prevPosition, params.nextPosition);
  const column = await prisma.column.findFirstOrThrow({ where: { id: params.toColumnId, tenantId } });
  await prisma.task.findFirstOrThrow({ where: { id: params.taskId, tenantId } });
  const task = await prisma.task.update({
    where: { id: params.taskId },
    data: { columnId: params.toColumnId, status: column.status, position: newPosition },
    include: { assignee: { select: { id: true, name: true } } }
  });
  await logActivity({ tenantId, taskId: task.id, userId, entityType: 'task', entityId: task.id, action: 'task.moved', metadata: { toColumnId: params.toColumnId } });
  io.to(`tenant:${tenantId}`).emit('task.moved', task);
  return task;
}

export async function deleteTask(tenantId: string, userId: string, taskId: string) {
  await prisma.task.findFirstOrThrow({ where: { id: taskId, tenantId } });
  const task = await prisma.task.delete({ where: { id: taskId } });
  await logActivity({ tenantId, taskId, userId, entityType: 'task', entityId: taskId, action: 'task.deleted' });
  io.to(`tenant:${tenantId}`).emit('task.deleted', { id: taskId });
  return task;
}

export async function addComment(tenantId: string, userId: string, taskId: string, content: string) {
  const comment = await prisma.comment.create({
    data: { tenantId, taskId, userId, content },
    include: { user: { select: { id: true, name: true } } }
  });
  const task = await prisma.task.findFirstOrThrow({ where: { id: taskId, tenantId } });
  await logActivity({ tenantId, taskId, userId, entityType: 'comment', entityId: comment.id, action: 'comment.added' });
  if (task.assigneeId && task.assigneeId !== userId) {
    await createNotification(tenantId, task.assigneeId, 'comment_added', `New comment on: ${task.title}`);
  }
  io.to(`tenant:${tenantId}`).emit('comment.added', { taskId, comment });
  return comment;
}
