import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';

const schema = z.object({ name: z.string().min(2), description: z.string().optional() });

export async function listProjects(req: Request, res: Response) {
  const projects = await prisma.project.findMany({ where: { tenantId: req.auth!.tenantId, archived: false }, include: { boards: true } });
  res.json(projects);
}

export async function createProject(req: Request, res: Response) {
  const tenantId = req.auth!.tenantId;
  const data = schema.parse(req.body);
  const project = await prisma.project.create({ data: { tenantId, ...data } });
  const board = await prisma.board.create({ data: { tenantId, projectId: project.id, name: `${project.name} Board` } });
  const columns = [
    { name: 'Todo', status: 'TODO', position: 1 },
    { name: 'In Progress', status: 'IN_PROGRESS', position: 2 },
    { name: 'Done', status: 'DONE', position: 3 }
  ] as const;
  for (const column of columns) {
    await prisma.column.create({ data: { tenantId, boardId: board.id, ...column } });
  }
  res.json({ project, board });
}

export async function updateProject(req: Request, res: Response) {
  const data = schema.partial().parse(req.body);
  await prisma.project.findFirstOrThrow({ where: { id: req.params.id, tenantId: req.auth!.tenantId } });
  const project = await prisma.project.update({ where: { id: req.params.id }, data });
  res.json(project);
}
