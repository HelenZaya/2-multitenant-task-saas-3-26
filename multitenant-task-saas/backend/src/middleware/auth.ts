import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/tokens.js';
import { StatusCodes } from 'http-status-codes';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Missing access token' });
  }
  try {
    const token = header.split(' ')[1];
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid access token' });
  }
}
