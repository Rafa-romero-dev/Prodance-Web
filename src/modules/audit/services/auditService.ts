import type { ServiceResult, AuditLogDTO } from '@/types'
import { AuditLogRepository } from '../repositories/auditLogRepository'
import type { CreateAuditLogInput, AuditLogFilters, AuditAction } from '../types'

export class AuditService {
  private repository: AuditLogRepository

  constructor(repository?: AuditLogRepository) {
    this.repository = repository || new AuditLogRepository()
  }

  async log(
    administratorId: string,
    entityType: string,
    entityId: string,
    action: AuditAction,
    options?: {
      previousState?: unknown
      newState?: unknown
      metadata?: Record<string, unknown>
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<ServiceResult<AuditLogDTO>> {
    try {
      const auditLog = await this.repository.create({
        administratorId,
        entityType,
        entityId,
        action,
        previousState: options?.previousState ? JSON.stringify(options.previousState) : undefined,
        newState: options?.newState ? JSON.stringify(options.newState) : undefined,
        metadata: options?.metadata,
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
      })

      return {
        success: true,
        data: auditLog,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? new Error(`Failed to create audit log: ${error.message}`) : (error as any),
      }
    }
  }

  async getAuditHistory(
    entityType: string,
    entityId: string
  ): Promise<ServiceResult<AuditLogDTO[]>> {
    try {
      const logs = await this.repository.findByEntity(entityType, entityId)

      return {
        success: true,
        data: logs,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error
          ? new Error(`Failed to fetch audit history: ${error.message}`)
          : (error as any),
      }
    }
  }

  async getRecentLogs(limit: number = 50): Promise<ServiceResult<AuditLogDTO[]>> {
    try {
      const logs = await this.repository.findRecent(limit)

      return {
        success: true,
        data: logs,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error
          ? new Error(`Failed to fetch recent logs: ${error.message}`)
          : (error as any),
      }
    }
  }

  async getFilteredLogs(filters: AuditLogFilters): Promise<ServiceResult<AuditLogDTO[]>> {
    try {
      const logs = await this.repository.findByFilters(filters)

      return {
        success: true,
        data: logs,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error
          ? new Error(`Failed to fetch filtered logs: ${error.message}`)
          : (error as any),
      }
    }
  }
}

// Singleton instance
let auditService: AuditService | null = null

export function getAuditService(): AuditService {
  if (!auditService) {
    auditService = new AuditService()
  }
  return auditService
}
