//prisma client is a singleton, so we need to create a singleton client that we can use in the entire application

import { Prisma, PrismaClient } from '@prisma/client';
const prismaClientSingleton = () => {
  return new PrismaClient();
};

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma, Prisma };
