import type { ServiceResult } from '@/types'
import { BusinessRuleError, RecoveryError } from '@/lib/errors'
import { getAuditService } from '@/modules/audit/services/auditService'
import { RecoveryRepository } from '../repositories/recoveryRepository'
import type { RecoveryDTO, RecoveryGenerationResult } from '../types'
import {
  generateRecoveryCharge,
  hasActiveRecovery,
  validateRecoveryPrerequisites,
} from '../utils/recoveryGenerator'
import { blockEnrollment, unblockEnrollment, isEnrollmentBlocked } from '../utils/blockingManager'
import { prisma } from '@/lib/prisma'

export class RecoveryService {
  private repository: RecoveryRepository
  private auditService = getAuditService()

  constructor(repository?: RecoveryRepository) {
    this.repository = repository || new RecoveryRepository()
  }

  /**
   * Generate a recovery when consecutive absences are detected
   * Business Rule: Auto-generated only, always generates charge and blocks enrollment
   */
  async generateRecovery(
    enrollmentId: string,
    teacherId: string,
    administratorId: string
  ): Promise<ServiceResult<RecoveryGenerationResult>> {
    try {
      // Validate prerequisites
      const validation = await validateRecoveryPrerequisites(enrollmentId)
      if (!validation.valid) {
        throw new RecoveryError(
          'RECOVERY_VALIDATION_FAILED',
          validation.errors.join('; '),
          { enrollmentId, errors: validation.errors }
        )
      }

      // Check if recovery already exists (idempotency)
      const alreadyHasRecovery = await hasActiveRecovery(enrollmentId)
      if (alreadyHasRecovery) {
        throw new RecoveryError(
          'RECOVERY_ALREADY_EXISTS',
          'An active recovery already exists for this enrollment',
          { enrollmentId }
        )
      }

      // Get enrollment details
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        select: { studentId: true, classId: true },
      })

      if (!enrollment) {
        throw new RecoveryError('ENROLLMENT_NOT_FOUND', 'Enrollment not found', { enrollmentId })
      }

      return await this.repository.withTransaction(async (tx) => {
        // Create the recovery record
        const recovery = await tx.recovery.create({
          data: {
            enrollmentId,
            teacherId,
            chargeId: '', // Placeholder, will be updated
            status: 'PENDING_PAYMENT',
          },
        })

        // Generate recovery charge
        const chargeId = await generateRecoveryCharge(
          enrollment.studentId,
          enrollmentId,
          recovery.id,
          administratorId
        )

        // Update recovery with charge ID
        const updatedRecovery = await tx.recovery.update({
          where: { id: recovery.id },
          data: { chargeId },
        })

        // Block the enrollment
        await tx.enrollment.update({
          where: { id: enrollmentId },
          data: { status: 'BLOCKED_RECOVERY' },
        })

        // Log the action
        await this.auditService.log(
          administratorId,
          'Recovery',
          updatedRecovery.id,
          'RecoveryGenerated',
          {
            metadata: {
              enrollmentId,
              chargeId,
              studentId: enrollment.studentId,
            },
          }
        )

        return {
          success: true,
          data: {
            recovery: {
              id: updatedRecovery.id,
              enrollmentId: updatedRecovery.enrollmentId,
              status: updatedRecovery.status,
              generatedAt: updatedRecovery.generatedAt,
              scheduledAt: updatedRecovery.scheduledAt,
              completedAt: updatedRecovery.completedAt,
              teacherId: updatedRecovery.teacherId,
              chargeId: updatedRecovery.chargeId,
              completionNotes: updatedRecovery.completionNotes,
              createdAt: updatedRecovery.createdAt,
              updatedAt: updatedRecovery.updatedAt,
            },
            chargeCreated: true,
            enrollmentBlocked: true,
            events: [
              { type: 'RecoveryGenerated', recoveryId: updatedRecovery.id },
              { type: 'EnrollmentBlocked', enrollmentId },
              { type: 'ChargeCreated', chargeId },
            ],
          },
        }
      })
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to generate recovery'
      this.log('error', message, error)

      const businessError = new BusinessRuleError('RECOVERY_ERROR', message)
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Complete a recovery
   * Business Rule: Unblock enrollment, reset absence counter, mark completed
   */
  async completeRecovery(
    recoveryId: string,
    completedAt: Date,
    completionNotes: string | undefined,
    administratorId: string
  ): Promise<ServiceResult<RecoveryDTO>> {
    try {
      // Get recovery and verify it exists and is in valid state
      const recovery = await this.repository.getRecoveryById(recoveryId)

      if (!recovery) {
        throw new RecoveryError('RECOVERY_NOT_FOUND', 'Recovery not found', { recoveryId })
      }

      if (recovery.status === 'COMPLETED') {
        throw new RecoveryError(
          'RECOVERY_ALREADY_COMPLETED',
          'This recovery has already been completed',
          { recoveryId }
        )
      }

      if (recovery.status === 'CANCELLED') {
        throw new RecoveryError(
          'RECOVERY_CANCELLED',
          'Cannot complete a cancelled recovery',
          { recoveryId }
        )
      }

      return await this.repository.withTransaction(async (tx) => {
        // Complete the recovery
        const completed = await tx.recovery.update({
          where: { id: recoveryId },
          data: {
            status: 'COMPLETED',
            completedAt,
            completionNotes: completionNotes || null,
            updatedAt: new Date(),
          },
        })

        // Unblock the enrollment (return to ACTIVE)
        await tx.enrollment.update({
          where: { id: recovery.enrollmentId },
          data: { status: 'ACTIVE' },
        })

        // Log the action
        await this.auditService.log(
          administratorId,
          'Recovery',
          recoveryId,
          'RecoveryCompleted',
          {
            metadata: {
              enrollmentId: recovery.enrollmentId,
              completedAt,
              completionNotes,
            },
          }
        )

        return {
          success: true,
          data: {
            id: completed.id,
            enrollmentId: completed.enrollmentId,
            status: completed.status,
            generatedAt: completed.generatedAt,
            scheduledAt: completed.scheduledAt,
            completedAt: completed.completedAt,
            teacherId: completed.teacherId,
            chargeId: completed.chargeId,
            completionNotes: completed.completionNotes,
            createdAt: completed.createdAt,
            updatedAt: completed.updatedAt,
          },
        }
      })
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to complete recovery'
      this.log('error', message, error)

      const businessError = new BusinessRuleError('RECOVERY_ERROR', message)
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Cancel a recovery
   * Business Rule: Requires justification, never delete
   */
  async cancelRecovery(
    recoveryId: string,
    reason: string,
    administratorId: string
  ): Promise<ServiceResult<RecoveryDTO>> {
    try {
      // Get recovery
      const recovery = await this.repository.getRecoveryById(recoveryId)

      if (!recovery) {
        throw new RecoveryError('RECOVERY_NOT_FOUND', 'Recovery not found', { recoveryId })
      }

      if (recovery.status === 'COMPLETED') {
        throw new RecoveryError(
          'RECOVERY_ALREADY_COMPLETED',
          'Cannot cancel a completed recovery',
          { recoveryId }
        )
      }

      if (recovery.status === 'CANCELLED') {
        throw new RecoveryError('RECOVERY_ALREADY_CANCELLED', 'Recovery is already cancelled', {
          recoveryId,
        })
      }

      return await this.repository.withTransaction(async (tx) => {
        // Cancel the recovery
        const cancelled = await tx.recovery.update({
          where: { id: recoveryId },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date(),
          },
        })

        // Unblock the enrollment
        await tx.enrollment.update({
          where: { id: recovery.enrollmentId },
          data: { status: 'ACTIVE' },
        })

        // Log the action
        await this.auditService.log(
          administratorId,
          'Recovery',
          recoveryId,
          'RecoveryCancelled',
          {
            metadata: {
              enrollmentId: recovery.enrollmentId,
              reason,
            },
          }
        )

        return {
          success: true,
          data: {
            id: cancelled.id,
            enrollmentId: cancelled.enrollmentId,
            status: cancelled.status,
            generatedAt: cancelled.generatedAt,
            scheduledAt: cancelled.scheduledAt,
            completedAt: cancelled.completedAt,
            teacherId: cancelled.teacherId,
            chargeId: cancelled.chargeId,
            completionNotes: cancelled.completionNotes,
            createdAt: cancelled.createdAt,
            updatedAt: cancelled.updatedAt,
          },
        }
      })
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to cancel recovery'
      this.log('error', message, error)

      const businessError = new BusinessRuleError('RECOVERY_ERROR', message)
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Mark recovery as ready to schedule (when payment is approved)
   */
  async markReadyToSchedule(
    recoveryId: string,
    scheduledAt: Date | undefined,
    administratorId: string
  ): Promise<ServiceResult<RecoveryDTO>> {
    try {
      const recovery = await this.repository.getRecoveryById(recoveryId)

      if (!recovery) {
        throw new RecoveryError('RECOVERY_NOT_FOUND', 'Recovery not found', { recoveryId })
      }

      if (recovery.status !== 'PENDING_PAYMENT') {
        throw new RecoveryError(
          'RECOVERY_INVALID_STATE',
          'Recovery must be in PENDING_PAYMENT state to mark as ready',
          { recoveryId, currentStatus: recovery.status }
        )
      }

      const updated = await this.repository.markReadyToSchedule(recoveryId, scheduledAt)

      // Log the action
      await this.auditService.log(
        administratorId,
        'Recovery',
        recoveryId,
        'RecoveryStarted',
        {
          metadata: {
            scheduledAt,
          },
        }
      )

      return {
        success: true,
        data: updated,
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to mark recovery as ready'
      const businessError = new BusinessRuleError('RECOVERY_ERROR', message)
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Get recovery history for an enrollment
   */
  async getRecoveryHistory(
    enrollmentId: string
  ): Promise<ServiceResult<RecoveryDTO[]>> {
    try {
      const recoveries = await this.repository.getRecoveriesForEnrollment(enrollmentId)

      return {
        success: true,
        data: recoveries,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch recovery history'
      const businessError = new BusinessRuleError('RECOVERY_ERROR', message)
      return {
        success: false,
        error: businessError,
      }
    }
  }

  private log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
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
