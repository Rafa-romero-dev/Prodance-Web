import { BaseRepository } from '@/lib/baseRepository'
import type { StudentDTO, PageParams, PageResult } from '@/types'
import type { StudentFilters, StudentWithCycles } from '../types'

export class StudentRepository extends BaseRepository {
  async findById(id: string): Promise<StudentDTO | null> {
    try {
      const student = await this.db.student.findUnique({
        where: { id },
      })
      return student || null
    } catch (error) {
      this.handlePrismaError(error, 'StudentRepository.findById')
    }
  }

  async findByEmail(email: string): Promise<StudentDTO | null> {
    try {
      const student = await this.db.student.findUnique({
        where: { email },
      })
      return student || null
    } catch (error) {
      this.handlePrismaError(error, 'StudentRepository.findByEmail')
    }
  }

  async findAll(filters?: StudentFilters, page?: PageParams): Promise<PageResult<StudentDTO>> {
    try {
      const pageSize = page?.pageSize || 20
      const pageNum = page?.page || 1
      const skip = (pageNum - 1) * pageSize

      const where: any = {}

      if (filters?.status) {
        where.status = filters.status
      }

      if (filters?.searchTerm) {
        where.OR = [
          { firstName: { contains: filters.searchTerm, mode: 'insensitive' } },
          { lastName: { contains: filters.searchTerm, mode: 'insensitive' } },
          { email: { contains: filters.searchTerm, mode: 'insensitive' } },
        ]
      }

      const orderBy: any = {}
      const sortBy = filters?.sortBy || 'lastName'
      const sortOrder = filters?.sortOrder || 'asc'

      if (sortBy === 'name') {
        orderBy.lastName = sortOrder
        orderBy.firstName = sortOrder
      } else {
        orderBy[sortBy] = sortOrder
      }

      const [students, total] = await Promise.all([
        this.db.student.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
        }),
        this.db.student.count({ where }),
      ])

      return {
        items: students,
        total,
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      }
    } catch (error) {
      this.handlePrismaError(error, 'StudentRepository.findAll')
    }
  }

  async findWithCycles(id: string): Promise<StudentWithCycles | null> {
    try {
      const student = await this.db.student.findUnique({
        where: { id },
        include: {
          studentCycles: {
            orderBy: { startDate: 'desc' },
          },
        },
      })

      if (!student) return null

      return student as StudentWithCycles
    } catch (error) {
      this.handlePrismaError(error, 'StudentRepository.findWithCycles')
    }
  }

  async create(data: {
    firstName: string
    lastName: string
    email: string
    phone: string
    birthDate?: Date
    guardianName?: string
    notes?: string
  }): Promise<StudentDTO> {
    try {
      const student = await this.db.student.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          birthDate: data.birthDate,
          guardianName: data.guardianName,
          notes: data.notes,
          enrollmentDate: new Date(),
          status: 'ACTIVE',
        },
      })

      this.log('info', `Student created: ${student.id}`, {
        email: student.email,
      })

      return student
    } catch (error) {
      this.handlePrismaError(error, 'StudentRepository.create')
    }
  }

  async update(
    id: string,
    data: {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
      birthDate?: Date
      guardianName?: string
      notes?: string
    }
  ): Promise<StudentDTO> {
    try {
      const student = await this.db.student.update({
        where: { id },
        data,
      })

      this.log('info', `Student updated: ${id}`)

      return student
    } catch (error) {
      this.handlePrismaError(error, 'StudentRepository.update')
    }
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<StudentDTO> {
    try {
      const student = await this.db.student.update({
        where: { id },
        data: { status },
      })

      this.log('info', `Student status updated: ${id}`, { status })

      return student
    } catch (error) {
      this.handlePrismaError(error, 'StudentRepository.updateStatus')
    }
  }

  async countByStatus(status: 'ACTIVE' | 'INACTIVE'): Promise<number> {
    try {
      return await this.db.student.count({
        where: { status },
      })
    } catch (error) {
      this.handlePrismaError(error, 'StudentRepository.countByStatus')
    }
  }

  async countCreatedInMonth(year: number, month: number): Promise<number> {
    try {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)

      return await this.db.student.count({
        where: {
          enrollmentDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      })
    } catch (error) {
      this.handlePrismaError(error, 'StudentRepository.countCreatedInMonth')
    }
  }
}
