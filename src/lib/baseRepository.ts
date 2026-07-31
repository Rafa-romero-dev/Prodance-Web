import { PrismaClient, Prisma } from '@prisma/client'
import { BusinessRuleError } from './errors'
import { prisma } from './prisma'

export class BaseRepository {
  protected db: PrismaClient

  constructor(db: PrismaClient = prisma) {
    this.db = db
  }

  // Transaction support for critical operations
  async withTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return this.db.$transaction(callback)
  }

  // Error handling - convert Prisma errors to domain errors
  protected handlePrismaError(error: unknown, context: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const message = `Database error in ${context}: ${error.message}`
      console.error(message, error)

      if (error.code === 'P2002') {
        throw new BusinessRuleError(
          'UNIQUE_CONSTRAINT_VIOLATION',
          `A record with this value already exists`,
          { context }
        )
      }

      if (error.code === 'P2025') {
        throw new BusinessRuleError(
          'RECORD_NOT_FOUND',
          `Record not found in ${context}`,
          { context }
        )
      }

      throw new BusinessRuleError('DATABASE_ERROR', message, { context })
    }

    if (error instanceof BusinessRuleError) {
      throw error
    }

    const message = `Unexpected error in ${context}: ${error instanceof Error ? error.message : String(error)}`
    console.error(message, error)
    throw new BusinessRuleError('UNEXPECTED_ERROR', message, { context })
  }

  // Logging
  protected log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    const timestamp = new Date().toISOString()
    const className = this.constructor.name

    if (level === 'info') {
      console.log(`[${timestamp}] [${className}] ${message}`, data)
    } else if (level === 'warn') {
      console.warn(`[${timestamp}] [${className}] ${message}`, data)
    } else {
      console.error(`[${timestamp}] [${className}] ${message}`, data)
    }
  }
}
