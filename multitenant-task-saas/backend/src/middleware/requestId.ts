import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  req.requestId = uuid();
  res.setHeader('x-request-id', req.requestId);
  next();
}
