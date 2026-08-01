import type { ServiceResult } from '@/types'
import { BusinessRuleError } from '@/lib/errors'
import { getAuditService } from '@/modules/audit/services/auditService'
import { AssessmentRepository } from '../repositories/assessmentRepository'
import type { AssessmentDTO } from '../types'
import {
  generateAssessmentCharge,
  validateAssessmentPrerequisites,
  isAssessmentMandatory,
} from '../utils/assessmentChargeGenerator'
import { validateTargetClass, validateLevelSelection } from '../utils/levelValidator'
import { prisma } from '@/lib/prisma'

export class AssessmentService {
  private repository: AssessmentRepository
  private auditService = getAuditService()

  constructor(repository?: AssessmentRepository) {
    this.repository = repository || new AssessmentRepository()
  }

  /**
   * Create assessment for student re-entry
   * Business Rule: Auto-generates charge, mandatory for regular classes
   */
  async createAssessment(
    studentId: string,
    studentCycleId: string,
    classId: string,
    teacherId: string,
    administratorId: string
  ): Promise<ServiceResult<AssessmentDTO>> {
    try {
      // Validate prerequisites
      const validation = await validateAssessmentPrerequisites(
        studentId,
        studentCycleId,
        classId
      )

      if (!validation.valid) {
        throw new BusinessRuleError(
          'ASSESSMENT_VALIDATION_FAILED',
          validation.errors.join('; '),
          { studentId, errors: validation.errors }
        )
      }

      return await this.repository.withTransaction(async (tx) => {
        // Create the assessment record
        const assessment = await tx.levelAssessment.create({
          data: {
            studentId,
            studentCycleId,
            recommendedClassId: null,
            teacherId,
            chargeId: '', // Placeholder
            status: 'PENDING_PAYMENT',
          },
        })

        // Generate assessment charge
        const chargeId = await generateAssessmentCharge(studentId, assessment.id, administratorId)

        // Update assessment with charge ID
        const updatedAssessment = await tx.levelAssessment.update({
          where: { id: assessment.id },
          data: { chargeId },
        })

        // Log the action
        await this.auditService.log(
          administratorId,
          'LevelAssessment',
          updatedAssessment.id,
          'LevelAssessmentCreated',
          {
            metadata: {
              studentId,
              studentCycleId,
              classId,
              chargeId,
              isMandatory: validation.isRegularClass,
            },
          }
        )

        return {
          success: true,
          data: {
            id: updatedAssessment.id,
            studentId: updatedAssessment.studentId,
            studentCycleId: updatedAssessment.studentCycleId,
            recommendedClassId: updatedAssessment.recommendedClassId,
            status: updatedAssessment.status,
            teacherId: updatedAssessment.teacherId,
            chargeId: updatedAssessment.chargeId,
            performedAt: updatedAssessment.performedAt,
            notes: updatedAssessment.notes,
            createdAt: updatedAssessment.createdAt,
            updatedAt: updatedAssessment.updatedAt,
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

      const message = error instanceof Error ? error.message : 'Failed to create assessment'
      this.log('error', message, error)

      const businessError = new BusinessRuleError('ASSESSMENT_ERROR', message)
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Mark assessment as ready (payment approved)
   * Business Rule: Only from PENDING_PAYMENT status
   */
  async markReady(
    assessmentId: string,
    administratorId: string
  ): Promise<ServiceResult<AssessmentDTO>> {
    try {
      const assessment = await this.repository.getAssessmentById(assessmentId)

      if (!assessment) {
        throw new BusinessRuleError('ASSESSMENT_NOT_FOUND', 'Assessment not found', {
          assessmentId,
        })
      }

      if (assessment.status !== 'PENDING_PAYMENT') {
        throw new BusinessRuleError(
          'ASSESSMENT_INVALID_STATE',
          'Assessment must be in PENDING_PAYMENT status',
          { assessmentId, currentStatus: assessment.status }
        )
      }

      const updated = await this.repository.markReady(assessmentId)

      // Note: No audit log for marking ready - charge payment approved is logged elsewhere (Finance module)

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

      const message = error instanceof Error ? error.message : 'Failed to mark assessment ready'
      const businessError = new BusinessRuleError('ASSESSMENT_ERROR', message)
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Complete assessment (teacher selects target level)
   * Business Rule: Creates enrollment automatically
   */
  async completeAssessment(
    assessmentId: string,
    targetClassId: string,
    notes: string | undefined,
    administratorId: string
  ): Promise<ServiceResult<AssessmentDTO>> {
    try {
      const assessment = await this.repository.getAssessmentById(assessmentId)

      if (!assessment) {
        throw new BusinessRuleError('ASSESSMENT_NOT_FOUND', 'Assessment not found', {
          assessmentId,
        })
      }

      if (assessment.status !== 'READY') {
        throw new BusinessRuleError(
          'ASSESSMENT_INVALID_STATE',
          'Assessment must be in READY status to complete',
          { assessmentId, currentStatus: assessment.status }
        )
      }

      // Validate target class
      const targetValidation = await validateTargetClass(targetClassId)
      if (!targetValidation.valid) {
        throw new BusinessRuleError(
          'INVALID_TARGET_CLASS',
          targetValidation.error || 'Invalid target class',
          { targetClassId }
        )
      }

      return await this.repository.withTransaction(async (tx) => {
        // Complete the assessment
        const completed = await tx.levelAssessment.update({
          where: { id: assessmentId },
          data: {
            status: 'COMPLETED',
            recommendedClassId: targetClassId,
            performedAt: new Date(),
            notes: notes || null,
            updatedAt: new Date(),
          },
        })

        // Create new enrollment at selected level
        const enrollment = await tx.enrollment.create({
          data: {
            studentId: assessment.studentId,
            classId: targetClassId,
            studentCycleId: assessment.studentCycleId,
            createdById: administratorId,
            status: 'PENDING_PAYMENT',
            startDate: new Date(),
          },
        })

        // Create MONTHLY charge for the enrollment
        const activeEnrollments = await tx.enrollment.count({
          where: {
            studentId: assessment.studentId,
            status: { in: ['ACTIVE', 'PENDING_PAYMENT'] },
          },
        })

        // Calculate monthly price (hardcoded for now, should be configurable)
        const basePrice = 1500 // $15
        const additionalPrice = 500 // $5 per additional class
        const monthlyAmount = basePrice + (activeEnrollments - 1) * additionalPrice

        await tx.charge.create({
          data: {
            studentId: assessment.studentId,
            enrollmentId: enrollment.id,
            type: 'MONTHLY',
            status: 'PENDING',
            description: 'Monthly Tuition',
            amount: monthlyAmount,
            remainingAmount: monthlyAmount,
            createdById: administratorId,
          },
        })

        // Log the action
        await this.auditService.log(
          administratorId,
          'LevelAssessment',
          assessmentId,
          'LevelAssessmentCompleted',
          {
            metadata: {
              studentId: assessment.studentId,
              targetClassId,
              enrollmentId: enrollment.id,
              notes,
            },
          }
        )

        return {
          success: true,
          data: {
            id: completed.id,
            studentId: completed.studentId,
            studentCycleId: completed.studentCycleId,
            recommendedClassId: completed.recommendedClassId,
            status: completed.status,
            teacherId: completed.teacherId,
            chargeId: completed.chargeId,
            performedAt: completed.performedAt,
            notes: completed.notes,
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

      const message = error instanceof Error ? error.message : 'Failed to complete assessment'
      this.log('error', message, error)

      const businessError = new BusinessRuleError('ASSESSMENT_ERROR', message)
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Cancel assessment
   * Business Rule: Requires justification
   */
  async cancelAssessment(
    assessmentId: string,
    reason: string,
    administratorId: string
  ): Promise<ServiceResult<AssessmentDTO>> {
    try {
      const assessment = await this.repository.getAssessmentById(assessmentId)

      if (!assessment) {
        throw new BusinessRuleError('ASSESSMENT_NOT_FOUND', 'Assessment not found', {
          assessmentId,
        })
      }

      if (assessment.status === 'COMPLETED') {
        throw new BusinessRuleError(
          'ASSESSMENT_ALREADY_COMPLETED',
          'Cannot cancel a completed assessment',
          { assessmentId }
        )
      }

      if (assessment.status === 'CANCELLED') {
        throw new BusinessRuleError('ASSESSMENT_ALREADY_CANCELLED', 'Assessment is already cancelled', {
          assessmentId,
        })
      }

      const cancelled = await this.repository.cancelAssessment(assessmentId)

      // Log the action
      await this.auditService.log(
        administratorId,
        'LevelAssessment',
        assessmentId,
        'LevelAssessmentCancelled',
        {
          metadata: {
            studentId: assessment.studentId,
            reason,
          },
        }
      )

      return {
        success: true,
        data: cancelled,
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to cancel assessment'
      this.log('error', message, error)

      const businessError = new BusinessRuleError('ASSESSMENT_ERROR', message)
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Get assessment history for a student
   */
  async getAssessmentHistory(studentId: string): Promise<ServiceResult<AssessmentDTO[]>> {
    try {
      const assessments = await this.repository.getAssessmentsForStudent(studentId)

      return {
        success: true,
        data: assessments,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch assessment history'
      const businessError = new BusinessRuleError('ASSESSMENT_ERROR', message)
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
