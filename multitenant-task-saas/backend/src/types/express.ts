import { Role } from '@prisma/client';

export interface AuthUser {
  userId: string;
  tenantId: string;
  role: Role;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
      requestId?: string;
    }
  }
}
