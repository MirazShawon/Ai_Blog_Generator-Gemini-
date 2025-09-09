// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mongodb://localhost:27017/defaultdb'
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
