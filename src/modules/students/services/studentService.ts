import type { ServiceResult, StudentDTO, DomainEvent } from '@/types'
import {
  StudentNotFoundError,
  StudentEmailAlreadyExistsError,
  InvalidInputError,
} from '@/lib/errors'
import { getAuditService } from '@/modules/audit/services/auditService'
import { StudentRepository } from '../repositories/studentRepository'
import type { CreateStudentInput } from '../types/index'

export class StudentService {
  private repository: StudentRepository
  private auditService = getAuditService()

  constructor(repository?: StudentRepository) {
    this.repository = repository || new StudentRepository()
  }

  async createStudent(
    input: CreateStudentInput,
    administratorId: string
  ): Promise<ServiceResult<StudentDTO>> {
    const domainEvents: DomainEvent[] = []

    try {
      // Validate email doesn't exist
      const existing = await this.repository.findByEmail(input.email)
      if (existing) {
        throw new StudentEmailAlreadyExistsError(input.email)
      }

      // Create student within transaction
      const student = await this.repository.withTransaction(async (tx) => {
        // Create student
        const newStudent = await tx.student.create({
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            birthDate: input.birthDate,
            guardianName: input.guardianName,
            notes: input.notes,
            enrollmentDate: new Date(),
            status: 'ACTIVE',
          },
        })

        // Create initial student cycle
        await tx.studentCycle.create({
          data: {
            studentId: newStudent.id,
            status: 'ACTIVE',
            startDate: new Date(),
          },
        })

        // Create enrollment fee charge
        await tx.charge.create({
          data: {
            studentId: newStudent.id,
            type: 'ENROLLMENT',
            status: 'PENDING',
            description: 'Enrollment fee',
            amount: 0, // Configured via AcademySettings
            remainingAmount: 0,
            createdById: administratorId,
          },
        })

        return newStudent
      })

      // Log audit
      await this.auditService.log(administratorId, 'Student', student.id, 'StudentCreated', {
        newState: {
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
        },
      })

      // Create domain event
      domainEvents.push({
        type: 'StudentCreated',
        entityType: 'Student',
        entityId: student.id,
        timestamp: new Date(),
        data: {
          studentId: student.id,
          email: student.email,
          name: `${student.firstName} ${student.lastName}`,
        },
        userId: administratorId,
      })

      return {
        success: true,
        data: student,
        domainEvents,
      }
    } catch (error) {
      if (error instanceof StudentEmailAlreadyExistsError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to create student'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }

  async deactivateStudent(
    studentId: string,
    administratorId: string
  ): Promise<ServiceResult<StudentDTO>> {
    const domainEvents: DomainEvent[] = []

    try {
      const student = await this.repository.findById(studentId)
      if (!student) {
        throw new StudentNotFoundError(studentId)
      }

      // Deactivate student within transaction
      const updated = await this.repository.withTransaction(async (tx) => {
        // Update student status
        const updatedStudent = await tx.student.update({
          where: { id: studentId },
          data: { status: 'INACTIVE' },
        })

        // Close active enrollments
        const enrollments = await tx.enrollment.findMany({
          where: {
            studentId,
            status: 'ACTIVE',
          },
        })

        for (const enrollment of enrollments) {
          await tx.enrollment.update({
            where: { id: enrollment.id },
            data: { status: 'COMPLETED', endDate: new Date() },
          })
        }

        return updatedStudent
      })

      // Log audit
      await this.auditService.log(administratorId, 'Student', studentId, 'StudentDeactivated', {
        previousState: { status: 'ACTIVE' },
        newState: { status: 'INACTIVE' },
      })

      // Create domain event
      domainEvents.push({
        type: 'StudentDeactivated',
        entityType: 'Student',
        entityId: studentId,
        timestamp: new Date(),
        userId: administratorId,
      })

      return {
        success: true,
        data: updated,
        domainEvents,
      }
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to deactivate student'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }

  async reactivateStudent(
    studentId: string,
    administratorId: string
  ): Promise<ServiceResult<StudentDTO>> {
    const domainEvents: DomainEvent[] = []

    try {
      const student = await this.repository.findById(studentId)
      if (!student) {
        throw new StudentNotFoundError(studentId)
      }

      // Update student status to ACTIVE
      const updated = await this.repository.updateStatus(studentId, 'ACTIVE')

      // Log audit
      await this.auditService.log(administratorId, 'Student', studentId, 'StudentReactivated', {
        previousState: { status: 'INACTIVE' },
        newState: { status: 'ACTIVE' },
      })

      // Create domain event
      domainEvents.push({
        type: 'StudentReactivated',
        entityType: 'Student',
        entityId: studentId,
        timestamp: new Date(),
        userId: administratorId,
      })

      return {
        success: true,
        data: updated,
        domainEvents,
      }
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to reactivate student'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }

  async getStudent(studentId: string): Promise<ServiceResult<StudentDTO>> {
    try {
      const student = await this.repository.findById(studentId)
      if (!student) {
        throw new StudentNotFoundError(studentId)
      }

      return {
        success: true,
        data: student,
      }
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to fetch student'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }
}
