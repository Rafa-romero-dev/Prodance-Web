import { BaseRepository } from '@/lib/baseRepository'
import type { ClassDTO, PageParams, PageResult } from '@/types'
import type { ClassFilters, ScheduleInfo, ClassWithSchedule } from '../types'

export class ClassRepository extends BaseRepository {
  async findById(id: string): Promise<ClassDTO | null> {
    try {
      const classRecord = await this.db.class.findUnique({
        where: { id },
      })
      return classRecord || null
    } catch (error) {
      this.handlePrismaError(error, 'ClassRepository.findById')
    }
  }

  async findAll(filters?: ClassFilters, page?: PageParams): Promise<PageResult<ClassDTO>> {
    try {
      const pageSize = page?.pageSize || 20
      const pageNum = page?.page || 1
      const skip = (pageNum - 1) * pageSize

      const where: any = {}

      if (filters?.type) {
        where.type = filters.type
      }

      if (filters?.status) {
        where.status = filters.status
      }

      if (filters?.administratorId) {
        where.administratorId = filters.administratorId
      }

      if (filters?.level) {
        where.level = filters.level
      }

      const [classes, total] = await Promise.all([
        this.db.class.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: pageSize,
        }),
        this.db.class.count({ where }),
      ])

      return {
        items: classes,
        total,
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    } catch (error) {
      this.handlePrismaError(error, 'ClassRepository.findAll')
    }
  }

  async findWithCurrentSchedule(id: string): Promise<ClassWithSchedule | null> {
    try {
      const classRecord = await this.db.class.findUnique({
        where: { id },
        include: {
          scheduleVersions: {
            where: { isCurrent: true },
            take: 1,
          },
        },
      })

      if (!classRecord) return null

      return {
        ...classRecord,
        currentSchedule: classRecord.scheduleVersions[0],
      }
    } catch (error) {
      this.handlePrismaError(error, 'ClassRepository.findWithCurrentSchedule')
    }
  }

  async findCurrentSchedule(classId: string): Promise<ScheduleInfo | null> {
    try {
      const schedule = await this.db.scheduleVersion.findFirst({
        where: {
          classId,
          isCurrent: true,
        },
      })
      return schedule || null
    } catch (error) {
      this.handlePrismaError(error, 'ClassRepository.findCurrentSchedule')
    }
  }

  async findAllSchedules(classId: string): Promise<ScheduleInfo[]> {
    try {
      const schedules = await this.db.scheduleVersion.findMany({
        where: { classId },
        orderBy: { createdAt: 'desc' },
      })
      return schedules
    } catch (error) {
      this.handlePrismaError(error, 'ClassRepository.findAllSchedules')
    }
  }

  async create(data: {
    name: string
    type: 'REGULAR' | 'COMPLEMENTARY'
    level?: string
    capacity: number
    administratorId: string
  }): Promise<ClassDTO> {
    try {
      const classRecord = await this.db.class.create({
        data: {
          name: data.name,
          type: data.type,
          level: data.level,
          capacity: data.capacity,
          administratorId: data.administratorId,
          status: 'ACTIVE',
        },
      })

      this.log('info', `Class created: ${classRecord.id}`, {
        name: classRecord.name,
      })

      return classRecord
    } catch (error) {
      this.handlePrismaError(error, 'ClassRepository.create')
    }
  }

  async update(
    id: string,
    data: {
      name?: string
      level?: string
      capacity?: number
      administratorId?: string
      status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
    }
  ): Promise<ClassDTO> {
    try {
      const classRecord = await this.db.class.update({
        where: { id },
        data,
      })

      this.log('info', `Class updated: ${id}`)

      return classRecord
    } catch (error) {
      this.handlePrismaError(error, 'ClassRepository.update')
    }
  }

  async createScheduleVersion(data: {
    classId: string
    weekday: string
    startTime: string
    endTime: string
    effectiveFrom: Date
    effectiveUntil?: Date
  }): Promise<ScheduleInfo> {
    try {
      // Close current schedule
      await this.db.scheduleVersion.updateMany({
        where: {
          classId: data.classId,
          isCurrent: true,
        },
        data: { isCurrent: false },
      })

      // Create new schedule
      const schedule = await this.db.scheduleVersion.create({
        data: {
          classId: data.classId,
          weekday: data.weekday,
          startTime: data.startTime,
          endTime: data.endTime,
          effectiveFrom: data.effectiveFrom,
          effectiveUntil: data.effectiveUntil,
          isCurrent: true,
        },
      })

      this.log('info', `Schedule created for class ${data.classId}`, {
        weekday: data.weekday,
        startTime: data.startTime,
        endTime: data.endTime,
      })

      return schedule
    } catch (error) {
      this.handlePrismaError(error, 'ClassRepository.createScheduleVersion')
    }
  }

  async getEnrollmentCount(classId: string): Promise<number> {
    try {
      return await this.db.enrollment.count({
        where: {
          classId,
          status: { not: 'CANCELLED' },
        },
      })
    } catch (error) {
      this.handlePrismaError(error, 'ClassRepository.getEnrollmentCount')
    }
  }
}
