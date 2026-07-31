import { BaseRepository } from '@/lib/baseRepository'
import type { EnrollmentDTO, PageParams, PageResult } from '@/types'
import type { EnrollmentFilters, ActiveEnrollmentsCount } from '../types'

export class EnrollmentRepository extends BaseRepository {
  async findById(id: string): Promise<EnrollmentDTO | null> {
    try {
      const enrollment = await this.db.enrollment.findUnique({
        where: { id },
      })
      return enrollment || null
    } catch (error) {
      this.handlePrismaError(error, 'EnrollmentRepository.findById')
    }
  }

  async findByStudentAndClass(studentId: string, classId: string): Promise<EnrollmentDTO | null> {
    try {
      const enrollment = await this.db.enrollment.findFirst({
        where: {
          studentId,
          classId,
          status: { not: 'CANCELLED' },
        },
        orderBy: { createdAt: 'desc' },
      })
      return enrollment || null
    } catch (error) {
      this.handlePrismaError(error, 'EnrollmentRepository.findByStudentAndClass')
    }
  }

  async findActiveByStudent(studentId: string): Promise<EnrollmentDTO[]> {
    try {
      return await this.db.enrollment.findMany({
        where: {
          studentId,
          status: { not: 'CANCELLED' },
          endDate: null,
        },
        include: {
          class: true,
        },
      })
    } catch (error) {
      this.handlePrismaError(error, 'EnrollmentRepository.findActiveByStudent')
    }
  }

  async findByClass(classId: string): Promise<EnrollmentDTO[]> {
    try {
      return await this.db.enrollment.findMany({
        where: {
          classId,
          status: { in: ['ACTIVE', 'PENDING_PAYMENT'] },
        },
        orderBy: { createdAt: 'asc' },
      })
    } catch (error) {
      this.handlePrismaError(error, 'EnrollmentRepository.findByClass')
    }
  }

  async findAll(
    filters?: EnrollmentFilters,
    page?: PageParams
  ): Promise<PageResult<EnrollmentDTO>> {
    try {
      const pageSize = page?.pageSize || 20
      const pageNum = page?.page || 1
      const skip = (pageNum - 1) * pageSize

      const where: any = {}

      if (filters?.status) {
        where.status = filters.status
      }

      if (filters?.studentId) {
        where.studentId = filters.studentId
      }

      if (filters?.classId) {
        where.classId = filters.classId
      }

      if (filters?.studentCycleId) {
        where.studentCycleId = filters.studentCycleId
      }

      const [enrollments, total] = await Promise.all([
        this.db.enrollment.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        this.db.enrollment.count({ where }),
      ])

      return {
        items: enrollments,
        total,
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    } catch (error) {
      this.handlePrismaError(error, 'EnrollmentRepository.findAll')
    }
  }

  async create(data: {
    studentId: string
    classId: string
    studentCycleId: string
    createdById: string
    notes?: string
  }): Promise<EnrollmentDTO> {
    try {
      const enrollment = await this.db.enrollment.create({
        data: {
          studentId: data.studentId,
          classId: data.classId,
          studentCycleId: data.studentCycleId,
          createdById: data.createdById,
          notes: data.notes,
          status: 'PENDING_PAYMENT',
          startDate: new Date(),
        },
      })

      this.log('info', `Enrollment created: ${enrollment.id}`, {
        studentId: data.studentId,
        classId: data.classId,
      })

      return enrollment
    } catch (error) {
      this.handlePrismaError(error, 'EnrollmentRepository.create')
    }
  }

  async updateStatus(
    id: string,
    status: 'PENDING_PAYMENT' | 'ACTIVE' | 'BLOCKED_RECOVERY' | 'COMPLETED' | 'CANCELLED'
  ): Promise<EnrollmentDTO> {
    try {
      const enrollment = await this.db.enrollment.update({
        where: { id },
        data: {
          status,
          endDate: status === 'COMPLETED' ? new Date() : null,
        },
      })

      this.log('info', `Enrollment status updated: ${id}`, { status })

      return enrollment
    } catch (error) {
      this.handlePrismaError(error, 'EnrollmentRepository.updateStatus')
    }
  }

  async countActiveEnrollments(studentId: string): Promise<ActiveEnrollmentsCount> {
    try {
      const enrollments = await this.db.enrollment.findMany({
        where: {
          studentId,
          status: { in: ['ACTIVE', 'PENDING_PAYMENT'] },
        },
        include: {
          class: {
            select: { type: true },
          },
        },
      })

      const regularCount = enrollments.filter((e) => e.class.type === 'REGULAR').length
      const complementaryCount = enrollments.filter((e) => e.class.type === 'COMPLEMENTARY').length

      return {
        regularCount,
        complementaryCount,
        total: enrollments.length,
      }
    } catch (error) {
      this.handlePrismaError(error, 'EnrollmentRepository.countActiveEnrollments')
    }
  }

  async hasActiveRegularEnrollment(studentId: string): Promise<boolean> {
    try {
      const count = await this.db.enrollment.count({
        where: {
          studentId,
          status: { in: ['ACTIVE', 'PENDING_PAYMENT'] },
          class: {
            type: 'REGULAR',
          },
        },
      })

      return count > 0
    } catch (error) {
      this.handlePrismaError(error, 'EnrollmentRepository.hasActiveRegularEnrollment')
    }
  }

  async findWithStudentAndClass(id: string): Promise<any> {
    try {
      return await this.db.enrollment.findUnique({
        where: { id },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          class: {
            select: {
              id: true,
              name: true,
              type: true,
              level: true,
            },
          },
        },
      })
    } catch (error) {
      this.handlePrismaError(error, 'EnrollmentRepository.findWithStudentAndClass')
    }
  }
}
