import { Request, Response } from 'express';
import { z } from 'zod';
import * as taskService from '../services/task.service.js';

const createTaskSchema = z.object({ boardId: z.string(), projectId: z.string(), columnId: z.string(), title: z.string().min(2), description: z.string().optional(), assigneeId: z.string().optional(), dueDate: z.string().optional(), priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(), labels: z.array(z.string()).optional() });
const updateTaskSchema = createTaskSchema.partial().omit({ boardId: true, projectId: true, columnId: true });
const moveSchema = z.object({ toColumnId: z.string(), prevPosition: z.number().nullable().optional(), nextPosition: z.number().nullable().optional() });
const commentSchema = z.object({ content: z.string().min(1) });

export async function getBoard(req: Request, res: Response) {
  const board = await taskService.listBoard(req.auth!.tenantId, req.params.boardId);
  res.json(board);
}

export async function createTask(req: Request, res: Response) {
  const task = await taskService.createTask(req.auth!.tenantId, req.auth!.userId, createTaskSchema.parse(req.body));
  res.json(task);
}

export async function updateTask(req: Request, res: Response) {
  const task = await taskService.updateTask(req.auth!.tenantId, req.auth!.userId, req.params.id, updateTaskSchema.parse(req.body));
  res.json(task);
}

export async function moveTask(req: Request, res: Response) {
  const task = await taskService.moveTask(req.auth!.tenantId, req.auth!.userId, { taskId: req.params.id, ...moveSchema.parse(req.body) });
  res.json(task);
}

export async function deleteTask(req: Request, res: Response) {
  await taskService.deleteTask(req.auth!.tenantId, req.auth!.userId, req.params.id);
  res.json({ ok: true });
}

export async function addComment(req: Request, res: Response) {
  const comment = await taskService.addComment(req.auth!.tenantId, req.auth!.userId, req.params.id, commentSchema.parse(req.body).content);
  res.json(comment);
}
