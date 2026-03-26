import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthUser } from '../types/express.js';
import { env } from '../config/env.js';

export function signAccessToken(payload: AuthUser) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.accessExpiresIn });
}

export function signRefreshToken(payload: AuthUser) {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: `${env.refreshExpiresInDays}d` });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtSecret) as AuthUser;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as AuthUser;
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
