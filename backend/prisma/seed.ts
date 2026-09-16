import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const USERS = [
  {
    id: 'user-recruiter',
    name: 'Recrutador',
    email: 'recruiter@atrio.dev',
    role: 'RECRUITER' as const,
    packageSlug: 'FULL' as const,
  },
  {
    id: 'user-admin',
    name: 'Admin da suíte',
    email: 'admin@atrio.dev',
    role: 'ADMIN' as const,
    packageSlug: 'FULL' as const,
  },
  {
    id: 'user-comercial',
    name: 'Ana Comercial',
    email: 'comercial@atrio.dev',
    role: 'MEMBER' as const,
    packageSlug: 'COMERCIAL' as const,
  },
  {
    id: 'user-operacao',
    name: 'Bruno Operação',
    email: 'operacao@atrio.dev',
    role: 'MEMBER' as const,
    packageSlug: 'OPERACAO' as const,
  },
];

const SEED_LOGS: Array<{ userId: string; appSlug: string; hoursAgo: number }> = [
  { userId: 'user-recruiter', appSlug: 'vendacore', hoursAgo: 2 },
  { userId: 'user-recruiter', appSlug: 'discador', hoursAgo: 5 },
  { userId: 'user-comercial', appSlug: 'smarty', hoursAgo: 8 },
  { userId: 'user-comercial', appSlug: 'vendacore', hoursAgo: 26 },
  { userId: 'user-operacao', appSlug: 'kanban', hoursAgo: 3 },
  { userId: 'user-operacao', appSlug: 'discador', hoursAgo: 12 },
  { userId: 'user-admin', appSlug: 'observability', hoursAgo: 30 },
];

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.accessLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  for (const user of USERS) {
    await prisma.user.create({
      data: { ...user, passwordHash },
    });
  }

  for (const log of SEED_LOGS) {
    await prisma.accessLog.create({
      data: {
        userId: log.userId,
        appSlug: log.appSlug,
        launchedAt: new Date(Date.now() - log.hoursAgo * 60 * 60 * 1000),
      },
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
