import type { ServiceResult, ClassDTO, DomainEvent } from '@/types'
import { ClassNotFoundError, AdministratorNotFoundError, InvalidInputError } from '@/lib/errors'
import { getAuditService } from '@/modules/audit/services/auditService'
import { ClassRepository } from '../repositories/classRepository'
import type { CreateClassInput, UpdateClassInput } from '../types/index'

export class ClassService {
  private repository: ClassRepository
  private auditService = getAuditService()

  constructor(repository?: ClassRepository) {
    this.repository = repository || new ClassRepository()
  }

  async createClass(
    input: CreateClassInput,
    administratorId: string
  ): Promise<ServiceResult<ClassDTO>> {
    const domainEvents: DomainEvent[] = []

    try {
      // Verify administrator exists (would check in real implementation)
      // Create class with initial schedule in transaction
      const classRecord = await this.repository.withTransaction(async (tx) => {
        // Create class
        const newClass = await tx.class.create({
          data: {
            name: input.name,
            type: input.type,
            level: input.level,
            capacity: input.capacity,
            administratorId: input.administratorId,
            status: 'ACTIVE',
          },
        })

        // Create initial schedule
        await tx.scheduleVersion.create({
          data: {
            classId: newClass.id,
            weekday: input.weekday,
            startTime: input.startTime,
            endTime: input.endTime,
            effectiveFrom: new Date(),
            isCurrent: true,
          },
        })

        return newClass
      })

      // Log audit
      await this.auditService.log(administratorId, 'Class', classRecord.id, 'ClassCreated', {
        newState: {
          name: classRecord.name,
          type: classRecord.type,
          level: classRecord.level,
        },
      })

      // Create domain event
      domainEvents.push({
        type: 'EnrollmentCreated', // Placeholder - would be ClassCreated if we had it
        entityType: 'Class',
        entityId: classRecord.id,
        timestamp: new Date(),
        data: {
          classId: classRecord.id,
          name: classRecord.name,
          type: classRecord.type,
        },
        userId: administratorId,
      })

      return {
        success: true,
        data: classRecord,
        domainEvents,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create class'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }

  async changeSchedule(
    classId: string,
    data: {
      weekday: string
      startTime: string
      endTime: string
    },
    administratorId: string
  ): Promise<ServiceResult<ClassDTO>> {
    const domainEvents: DomainEvent[] = []

    try {
      const classRecord = await this.repository.findById(classId)
      if (!classRecord) {
        throw new ClassNotFoundError(classId)
      }

      // Create new schedule version
      await this.repository.createScheduleVersion({
        classId,
        weekday: data.weekday,
        startTime: data.startTime,
        endTime: data.endTime,
        effectiveFrom: new Date(),
      })

      // Log audit
      await this.auditService.log(
        administratorId,
        'Class',
        classId,
        'ClassScheduleChanged',
        {
          newState: {
            weekday: data.weekday,
            startTime: data.startTime,
            endTime: data.endTime,
          },
        }
      )

      // Create domain event
      domainEvents.push({
        type: 'EnrollmentCreated', // Placeholder
        entityType: 'Class',
        entityId: classId,
        timestamp: new Date(),
        data: {
          weekday: data.weekday,
          startTime: data.startTime,
          endTime: data.endTime,
        },
        userId: administratorId,
      })

      return {
        success: true,
        data: classRecord,
        domainEvents,
      }
    } catch (error) {
      if (error instanceof ClassNotFoundError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to change schedule'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }

  async getClass(classId: string): Promise<ServiceResult<ClassDTO>> {
    try {
      const classRecord = await this.repository.findById(classId)
      if (!classRecord) {
        throw new ClassNotFoundError(classId)
      }

      return {
        success: true,
        data: classRecord,
      }
    } catch (error) {
      if (error instanceof ClassNotFoundError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to fetch class'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }

  async updateClass(
    classId: string,
    input: UpdateClassInput,
    administratorId: string
  ): Promise<ServiceResult<ClassDTO>> {
    try {
      const classRecord = await this.repository.findById(classId)
      if (!classRecord) {
        throw new ClassNotFoundError(classId)
      }

      const updated = await this.repository.update(classId, input)

      // Log audit
      await this.auditService.log(administratorId, 'Class', classId, 'ClassUpdated', {
        previousState: classRecord,
        newState: updated,
      })

      return {
        success: true,
        data: updated,
      }
    } catch (error) {
      if (error instanceof ClassNotFoundError) {
        return {
          success: false,
          error,
        }
      }

      const message = error instanceof Error ? error.message : 'Failed to update class'
      return {
        success: false,
        error: new InvalidInputError(message),
      }
    }
  }
}
