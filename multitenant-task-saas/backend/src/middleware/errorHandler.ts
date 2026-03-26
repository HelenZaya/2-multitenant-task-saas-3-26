import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  logger.error({ err, requestId: req.requestId }, 'Unhandled error');
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Validation failed', issues: err.issues });
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  return res.status(500).json({ message });
}
