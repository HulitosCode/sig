import { PrismaClient } from '@/lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrisma(): PrismaClient {
  if (!connectionString) {
    throw new Error('DATABASE_URL não definido — verifica o ficheiro .env')
  }
  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({ adapter })
}

// Instância única por processo (cada PrismaClient tem o seu pool de ligações).
export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
