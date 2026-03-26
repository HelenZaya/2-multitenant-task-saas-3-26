# Architecture

- Frontend: React + Vite + Tailwind + Zustand + dnd-kit
- Backend: Express + TypeScript + Prisma + PostgreSQL + Socket.io
- Multi-tenancy: shared DB/shared tables using `tenantId` on every tenant-owned entity
- Auth: JWT access token + rotating refresh token
- Realtime: tenant-scoped Socket.io rooms
- Notifications: persisted notifications plus realtime push
- Billing: plan metadata at tenant level
