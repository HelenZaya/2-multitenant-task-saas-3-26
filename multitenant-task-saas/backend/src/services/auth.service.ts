import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { Plan, Role } from '@prisma/client';
import { env } from '../config/env.js';

export async function registerTenant(payload: { companyName: string; slug: string; name: string; email: string; password: string; }) {
  const passwordHash = await bcrypt.hash(payload.password, 10);
  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: payload.companyName,
        slug: payload.slug,
        subscriptions: { create: { plan: Plan.FREE, active: true } }
      }
    });
    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        name: payload.name,
        email: payload.email,
        passwordHash
      }
    });
    await tx.membership.create({ data: { tenantId: tenant.id, userId: user.id, role: Role.TENANT_ADMIN } });
    return { tenant, user };
  });
  return issueTokens({ userId: result.user.id, tenantId: result.tenant.id, email: result.user.email, name: result.user.name, role: Role.TENANT_ADMIN });
}

export async function login(payload: { email: string; password: string; slug: string }) {
  const tenant = await prisma.tenant.findUnique({ where: { slug: payload.slug } });
  if (!tenant) throw new Error('Workspace not found');
  const user = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email: payload.email } },
    include: { memberships: true }
  });
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(payload.password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');
  return issueTokens({ userId: user.id, tenantId: tenant.id, email: user.email, name: user.name, role: user.memberships[0].role });
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);
  const existing = await prisma.refreshToken.findFirst({ where: { tokenHash, userId: payload.userId, tenantId: payload.tenantId, revokedAt: null } });
  if (!existing || existing.expiresAt < new Date()) throw new Error('Invalid refresh token');
  existing.replacedBy = 'rotated';
  await prisma.refreshToken.update({ where: { id: existing.id }, data: { revokedAt: new Date(), replacedBy: 'rotated' } });
  return issueTokens(payload);
}

export async function revoke(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
}

async function issueTokens(authUser: { userId: string; tenantId: string; email: string; name: string; role: Role }) {
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);
  await prisma.refreshToken.create({
    data: {
      tenantId: authUser.tenantId,
      userId: authUser.userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + env.refreshExpiresInDays * 24 * 3600 * 1000)
    }
  });
  return { accessToken, refreshToken, user: authUser };
}
