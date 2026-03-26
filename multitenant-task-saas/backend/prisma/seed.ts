import { PrismaClient, Priority, Role, TaskStatus, Plan } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'zenith-demo' },
    update: {},
    create: {
      name: 'Zenith Demo',
      slug: 'zenith-demo',
      plan: Plan.PRO,
      subscriptions: { create: { plan: Plan.PRO, active: true } }
    }
  });

  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@zenith.local' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Helen Admin',
      email: 'admin@zenith.local',
      passwordHash,
      memberships: { create: { tenantId: tenant.id, role: Role.TENANT_ADMIN } }
    }
  });

  const member = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'member@zenith.local' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Team Member',
      email: 'member@zenith.local',
      passwordHash,
      memberships: { create: { tenantId: tenant.id, role: Role.TEAM_MEMBER } }
    }
  });

  const project = await prisma.project.upsert({
    where: { id: 'demo-project-id' },
    update: {},
    create: {
      id: 'demo-project-id',
      tenantId: tenant.id,
      name: 'Zenith Product Launch',
      description: 'Demo multi-tenant kanban project'
    }
  }).catch(async () => {
    return prisma.project.findFirstOrThrow({ where: { tenantId: tenant.id, name: 'Zenith Product Launch' } });
  });

  const board = await prisma.board.upsert({
    where: { id: 'demo-board-id' },
    update: {},
    create: {
      id: 'demo-board-id',
      tenantId: tenant.id,
      projectId: project.id,
      name: 'Main Board'
    }
  }).catch(async () => {
    return prisma.board.findFirstOrThrow({ where: { tenantId: tenant.id, name: 'Main Board' } });
  });

  const columns = [
    { id: 'col-todo', name: 'Todo', status: TaskStatus.TODO, position: 1 },
    { id: 'col-progress', name: 'In Progress', status: TaskStatus.IN_PROGRESS, position: 2 },
    { id: 'col-done', name: 'Done', status: TaskStatus.DONE, position: 3 }
  ];

  for (const column of columns) {
    await prisma.column.upsert({
      where: { id: column.id },
      update: {},
      create: {
        id: column.id,
        tenantId: tenant.id,
        boardId: board.id,
        name: column.name,
        status: column.status,
        position: column.position
      }
    });
  }

  const todoColumn = await prisma.column.findUniqueOrThrow({ where: { id: 'col-todo' } });
  const progressColumn = await prisma.column.findUniqueOrThrow({ where: { id: 'col-progress' } });

  const task1 = await prisma.task.upsert({
    where: { id: 'task-demo-1' },
    update: {},
    create: {
      id: 'task-demo-1',
      tenantId: tenant.id,
      projectId: project.id,
      boardId: board.id,
      columnId: todoColumn.id,
      title: 'Design landing page',
      description: 'Prepare dark SaaS marketing landing page',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
      position: 1,
      labels: ['design', 'frontend'],
      assigneeId: member.id
    }
  });

  await prisma.task.upsert({
    where: { id: 'task-demo-2' },
    update: {},
    create: {
      id: 'task-demo-2',
      tenantId: tenant.id,
      projectId: project.id,
      boardId: board.id,
      columnId: progressColumn.id,
      title: 'Build auth API',
      description: 'JWT auth and refresh token rotation',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.URGENT,
      dueDate: new Date(Date.now() + 1 * 24 * 3600 * 1000),
      position: 1,
      labels: ['backend', 'security'],
      assigneeId: admin.id
    }
  });

  await prisma.comment.createMany({
    data: [
      { tenantId: tenant.id, taskId: task1.id, userId: admin.id, content: 'Please keep the palette consistent.' },
      { tenantId: tenant.id, taskId: task1.id, userId: member.id, content: 'Working on a first draft now.' }
    ],
    skipDuplicates: true
  });

  console.log('Seed complete');
}

main().finally(() => prisma.$disconnect());
