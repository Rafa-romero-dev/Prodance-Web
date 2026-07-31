import { BaseRepository } from '@/lib/baseRepository'
import type { AuditLogDTO } from '@/types'
import type { CreateAuditLogInput, AuditLogFilters } from '../types'

export class AuditLogRepository extends BaseRepository {
  async findById(id: string): Promise<AuditLogDTO | null> {
    try {
      const log = await this.db.auditLog.findUnique({
        where: { id },
      })
      return log || null
    } catch (error) {
      this.handlePrismaError(error, 'AuditLogRepository.findById')
    }
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLogDTO[]> {
    try {
      const logs = await this.db.auditLog.findMany({
        where: {
          entityType,
          entityId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return logs
    } catch (error) {
      this.handlePrismaError(error, 'AuditLogRepository.findByEntity')
    }
  }

  async findRecent(limit: number = 50): Promise<AuditLogDTO[]> {
    try {
      const logs = await this.db.auditLog.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      })
      return logs
    } catch (error) {
      this.handlePrismaError(error, 'AuditLogRepository.findRecent')
    }
  }

  async findByFilters(filters: AuditLogFilters): Promise<AuditLogDTO[]> {
    try {
      const logs = await this.db.auditLog.findMany({
        where: {
          administratorId: filters.administratorId,
          entityType: filters.entityType,
          entityId: filters.entityId,
          action: filters.action,
          createdAt: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return logs
    } catch (error) {
      this.handlePrismaError(error, 'AuditLogRepository.findByFilters')
    }
  }

  async create(input: CreateAuditLogInput): Promise<AuditLogDTO> {
    try {
      const log = await this.db.auditLog.create({
        data: {
          administratorId: input.administratorId,
          entityType: input.entityType,
          entityId: input.entityId,
          action: input.action,
          previousState: input.previousState,
          newState: input.newState,
          metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      })

      this.log('info', `Audit log created for ${input.entityType}:${input.entityId}`, {
        action: input.action,
      })

      return log
    } catch (error) {
      this.handlePrismaError(error, 'AuditLogRepository.create')
    }
  }

  // Count logs by entity
  async countByEntity(entityType: string, entityId: string): Promise<number> {
    try {
      return await this.db.auditLog.count({
        where: {
          entityType,
          entityId,
        },
      })
    } catch (error) {
      this.handlePrismaError(error, 'AuditLogRepository.countByEntity')
    }
  }
}
