import { PrismaClient } from '@prisma/client'

/**
 * Single Prisma client instance, reused across hot reloads in dev so we
 * don't exhaust Neon's connection pool with every save.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
