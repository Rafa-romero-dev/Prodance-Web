import { BaseRepository } from '@/lib/baseRepository'
import { BusinessRuleError } from '@/lib/errors'
import type { RecoveryDTO } from '../types'

export class RecoveryRepository extends BaseRepository {
  /**
   * Create a new recovery
   * Business Rule: Recoveries are auto-generated, always with a charge
   */
  async createRecovery(
    enrollmentId: string,
    teacherId: string,
    chargeId: string
  ): Promise<RecoveryDTO> {
    try {
      return await this.withTransaction(async (tx) => {
        // Create the recovery
        const recovery = await tx.recovery.create({
          data: {
            enrollmentId,
            teacherId,
            chargeId,
            status: 'PENDING_PAYMENT',
          },
        })

        return this.mapToDTO(recovery)
      })
    } catch (error) {
      this.handlePrismaError(error, 'createRecovery')
    }
  }

  /**
   * Get recovery by ID
   */
  async getRecoveryById(recoveryId: string): Promise<RecoveryDTO | null> {
    try {
      const recovery = await this.db.recovery.findUnique({
        where: { id: recoveryId },
      })

      return recovery ? this.mapToDTO(recovery) : null
    } catch (error) {
      this.handlePrismaError(error, 'getRecoveryById')
    }
  }

  /**
   * Get recoveries for an enrollment
   */
  async getRecoveriesForEnrollment(enrollmentId: string): Promise<RecoveryDTO[]> {
    try {
      const recoveries = await this.db.recovery.findMany({
        where: { enrollmentId },
        orderBy: { generatedAt: 'desc' },
      })

      return recoveries.map((r) => this.mapToDTO(r))
    } catch (error) {
      this.handlePrismaError(error, 'getRecoveriesForEnrollment')
    }
  }

  /**
   * Get active (incomplete) recovery for enrollment
   */
  async getActiveRecoveryForEnrollment(enrollmentId: string): Promise<RecoveryDTO | null> {
    try {
      const recovery = await this.db.recovery.findFirst({
        where: {
          enrollmentId,
          status: { in: ['PENDING_PAYMENT', 'READY_TO_SCHEDULE'] },
        },
      })

      return recovery ? this.mapToDTO(recovery) : null
    } catch (error) {
      this.handlePrismaError(error, 'getActiveRecoveryForEnrollment')
    }
  }

  /**
   * Complete a recovery
   * Business Rule: Mark as completed, update timestamp, record notes
   */
  async completeRecovery(
    recoveryId: string,
    completedAt: Date,
    completionNotes?: string
  ): Promise<RecoveryDTO> {
    try {
      const recovery = await this.db.recovery.update({
        where: { id: recoveryId },
        data: {
          status: 'COMPLETED',
          completedAt,
          completionNotes: completionNotes || null,
          updatedAt: new Date(),
        },
      })

      return this.mapToDTO(recovery)
    } catch (error) {
      this.handlePrismaError(error, 'completeRecovery')
    }
  }

  /**
   * Cancel a recovery
   * Business Rule: Requires justification, never delete history
   */
  async cancelRecovery(recoveryId: string): Promise<RecoveryDTO> {
    try {
      const recovery = await this.db.recovery.update({
        where: { id: recoveryId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      })

      return this.mapToDTO(recovery)
    } catch (error) {
      this.handlePrismaError(error, 'cancelRecovery')
    }
  }

  /**
   * Mark recovery as ready to schedule (payment approved)
   */
  async markReadyToSchedule(recoveryId: string, scheduledAt?: Date): Promise<RecoveryDTO> {
    try {
      const recovery = await this.db.recovery.update({
        where: { id: recoveryId },
        data: {
          status: 'READY_TO_SCHEDULE',
          scheduledAt: scheduledAt || null,
          updatedAt: new Date(),
        },
      })

      return this.mapToDTO(recovery)
    } catch (error) {
      this.handlePrismaError(error, 'markReadyToSchedule')
    }
  }

  /**
   * Check if a recovery already exists for an enrollment
   * Business Rule: Avoid duplicate recoveries
   */
  async hasActiveRecovery(enrollmentId: string): Promise<boolean> {
    try {
      const recovery = await this.db.recovery.findFirst({
        where: {
          enrollmentId,
          status: { in: ['PENDING_PAYMENT', 'READY_TO_SCHEDULE'] },
        },
      })

      return !!recovery
    } catch (error) {
      this.handlePrismaError(error, 'hasActiveRecovery')
    }
  }

  /**
   * Get pending payment recoveries for a student
   */
  async getPendingPaymentRecoveries(studentId: string): Promise<RecoveryDTO[]> {
    try {
      const recoveries = await this.db.recovery.findMany({
        where: {
          enrollment: { studentId },
          status: 'PENDING_PAYMENT',
        },
        orderBy: { generatedAt: 'desc' },
      })

      return recoveries.map((r) => this.mapToDTO(r))
    } catch (error) {
      this.handlePrismaError(error, 'getPendingPaymentRecoveries')
    }
  }

  /**
   * Get ready to schedule recoveries
   */
  async getReadyToScheduleRecoveries(studentId: string): Promise<RecoveryDTO[]> {
    try {
      const recoveries = await this.db.recovery.findMany({
        where: {
          enrollment: { studentId },
          status: 'READY_TO_SCHEDULE',
        },
        orderBy: { generatedAt: 'desc' },
      })

      return recoveries.map((r) => this.mapToDTO(r))
    } catch (error) {
      this.handlePrismaError(error, 'getReadyToScheduleRecoveries')
    }
  }

  /**
   * Private helper: Map recovery record to DTO
   */
  private mapToDTO(record: any): RecoveryDTO {
    return {
      id: record.id,
      enrollmentId: record.enrollmentId,
      status: record.status,
      generatedAt: record.generatedAt,
      scheduledAt: record.scheduledAt,
      completedAt: record.completedAt,
      teacherId: record.teacherId,
      chargeId: record.chargeId,
      completionNotes: record.completionNotes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }
  }
}
