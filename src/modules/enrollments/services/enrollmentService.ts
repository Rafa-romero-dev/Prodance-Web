import type { ServiceResult, EnrollmentDTO, DomainEvent } from '@/types'
import {
  EnrollmentNotFoundError,
  EnrollmentAlreadyActiveError,
  StudentNotFoundError,
  ClassNotFoundError,
  InvalidInputError,
} from '@/lib/errors'
import { getAuditService } from '@/modules/audit/services/auditService'
import { calculateMonthlyPrice } from '@/lib/utils/pricing'
import { EnrollmentRepository } from '../repositories/enrollmentRepository'
import type { CreateEnrollmentInput } from '../types'

export class EnrollmentService {
  private repository: EnrollmentRepository
  private auditService = getAuditService()

  constructor(repository?: EnrollmentRepository) {
    this.repository = repository || new EnrollmentRepository()
  }

  async createEnrollment(
    input: CreateEnrollmentInput,
    administratorId: string
  ): Promise<ServiceResult<EnrollmentDTO>> {
    const domainEvents: DomainEvent[] = []

    try {
      // Validate student and class exist (would check in real implementation)
      // Validate only one active Regular enrollment per student
      const enrollment = await this.repository.withTransaction(async (tx) => {
        // Check for active Regular enrollment if this is a Regular class
        const isRegularClass = await tx.class.findUnique({
          where: { id: input.classId },
          select: { type: true },
        })

        if (isRegularClass?.type === 'REGULAR') {
          const hasActiveRegular = await tx.enrollment.count({
            where: {
              studentId: input.studentId,
              status: { in: ['ACTIVE', 'PENDING_PAYMENT'] },
              class: { type: 'REGULAR' },
            },
          })

          if (hasActiveRegular > 0) {
            throw new EnrollmentAlreadyActiveError(input.studentId, input.classId)
          }
        }

        // Create enrollment
        const newEnrollment = await tx.enrollment.create({
          data: {
            studentId: input.studentId,
            classId: input.classId,
            studentCycleId: input.studentCycleId,
            createdById: administratorId,
            notes: input.notes,
            status: 'PENDING_PAYMENT',
            startDate: new Date(),
          },
        })

        // Count active enrollments for this student to calculate monthly charge
        const activeEnrollments = await tx.enrollment.count({
          where: {
            studentId: input.studentId,
            status: { in: ['ACTIVE', 'PENDING_PAYMENT'] },
          },
        })

        // Generate MONTHLY charge based on number of active enrollments
        const monthlyPrice = calculateMonthlyPrice(activeEnrollments)

        await tx.charge.create({
          data: {
            studentId: input.studentId,
            enrollmentId: newEnrollment.id,
            type: 'MONTHLY',
            status: 'PENDING',
            description: `Monthly tuition (${activeEnrollments} class${activeEnrollments > 1 ? 'es' : ''})`,
            amount: monthlyPrice,
            remainingAmount: monthlyPrice,
            createdById: administratorId,
          },
        })

        return newEnrollment
      })

      // Log audit
      await this.auditService.log(
        administratorId,
        'Enrollment',
        enrollment.id,
        'EnrollmentCreated',
        {
          newState: {
            enrollmentId: enrollment.id,
            studentId: enrollment.studentId,
            classId: enrollment.classId,
            status: enrollment.status,
          },
        }
      )

      // Create domain event
      domainEvents.push({
        type: 'EnrollmentCreated',
        entityType: 'Enrollment',
        entityId: enrollment.id,
        timestamp: new Date(),
        data: {
          enrollmentId: enrollment.id,
          studentId: enrollment.studentId,
          classId: enrollment.classId,
        },
        userId: administratorId,
      })

      return {
        success: true,
        data: enrollment,
        domainEvents,
      }
    } catch (error) {
      if (error instanceof EnrollmentAlreadyActiveError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to create enrollment'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }

  async completeEnrollment(
    enrollmentId: string,
    administratorId: string
  ): Promise<ServiceResult<EnrollmentDTO>> {
    const domainEvents: DomainEvent[] = []

    try {
      const enrollment = await this.repository.findById(enrollmentId)
      if (!enrollment) {
        throw new EnrollmentNotFoundError(enrollmentId)
      }

      const updated = await this.repository.updateStatus(enrollmentId, 'COMPLETED')

      // Log audit
      await this.auditService.log(
        administratorId,
        'Enrollment',
        enrollmentId,
        'EnrollmentCompleted',
        {
          previousState: { status: enrollment.status },
          newState: { status: 'COMPLETED' },
        }
      )

      // Create domain event
      domainEvents.push({
        type: 'EnrollmentCreated', // Placeholder
        entityType: 'Enrollment',
        entityId: enrollmentId,
        timestamp: new Date(),
        userId: administratorId,
      })

      return {
        success: true,
        data: updated,
        domainEvents,
      }
    } catch (error) {
      if (error instanceof EnrollmentNotFoundError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to complete enrollment'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }

  async blockEnrollment(
    enrollmentId: string,
    administratorId: string
  ): Promise<ServiceResult<EnrollmentDTO>> {
    const domainEvents: DomainEvent[] = []

    try {
      const enrollment = await this.repository.findById(enrollmentId)
      if (!enrollment) {
        throw new EnrollmentNotFoundError(enrollmentId)
      }

      const updated = await this.repository.updateStatus(enrollmentId, 'BLOCKED_RECOVERY')

      // Log audit
      await this.auditService.log(
        administratorId,
        'Enrollment',
        enrollmentId,
        'EnrollmentBlocked',
        {
          previousState: { status: enrollment.status },
          newState: { status: 'BLOCKED_RECOVERY' },
        }
      )

      // Create domain event
      domainEvents.push({
        type: 'EnrollmentCreated', // Placeholder
        entityType: 'Enrollment',
        entityId: enrollmentId,
        timestamp: new Date(),
        userId: administratorId,
      })

      return {
        success: true,
        data: updated,
        domainEvents,
      }
    } catch (error) {
      if (error instanceof EnrollmentNotFoundError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to block enrollment'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }

  async unblockEnrollment(
    enrollmentId: string,
    administratorId: string
  ): Promise<ServiceResult<EnrollmentDTO>> {
    const domainEvents: DomainEvent[] = []

    try {
      const enrollment = await this.repository.findById(enrollmentId)
      if (!enrollment) {
        throw new EnrollmentNotFoundError(enrollmentId)
      }

      const updated = await this.repository.updateStatus(enrollmentId, 'ACTIVE')

      // Log audit
      await this.auditService.log(
        administratorId,
        'Enrollment',
        enrollmentId,
        'EnrollmentUnblocked',
        {
          previousState: { status: enrollment.status },
          newState: { status: 'ACTIVE' },
        }
      )

      // Create domain event
      domainEvents.push({
        type: 'EnrollmentCreated', // Placeholder
        entityType: 'Enrollment',
        entityId: enrollmentId,
        timestamp: new Date(),
        userId: administratorId,
      })

      return {
        success: true,
        data: updated,
        domainEvents,
      }
    } catch (error) {
      if (error instanceof EnrollmentNotFoundError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to unblock enrollment'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }

  async getEnrollment(enrollmentId: string): Promise<ServiceResult<EnrollmentDTO>> {
    try {
      const enrollment = await this.repository.findById(enrollmentId)
      if (!enrollment) {
        throw new EnrollmentNotFoundError(enrollmentId)
      }

      return {
        success: true,
        data: enrollment,
      }
    } catch (error) {
      if (error instanceof EnrollmentNotFoundError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to fetch enrollment'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }
}
