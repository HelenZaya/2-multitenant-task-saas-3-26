import { Request, Response } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service.js';

const registerSchema = z.object({ companyName: z.string().min(2), slug: z.string().min(2), name: z.string().min(2), email: z.string().email(), password: z.string().min(8) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8), slug: z.string().min(2) });

export async function registerTenant(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const result = await authService.registerTenant(data);
  res.json(result);
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const result = await authService.login(data);
  res.json(result);
}

export async function refresh(req: Request, res: Response) {
  const token = req.body.refreshToken;
  const result = await authService.refresh(token);
  res.json(result);
}

export async function logout(req: Request, res: Response) {
  await authService.revoke(req.body.refreshToken);
  res.json({ ok: true });
}
