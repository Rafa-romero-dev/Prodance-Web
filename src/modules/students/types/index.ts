import type { StudentDTO } from '@/types'

export interface CreateStudentInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate?: Date
  guardianName?: string
  notes?: string
}

export interface StudentWithCycles extends StudentDTO {
  studentCycles: {
    id: string
    status: 'ACTIVE' | 'COMPLETED'
    startDate: Date
    endDate: Date | null
  }[]
}

export interface StudentFilters {
  status?: 'ACTIVE' | 'INACTIVE'
  searchTerm?: string
  sortBy?: 'name' | 'email' | 'enrollmentDate'
  sortOrder?: 'asc' | 'desc'
}

export interface StudentStats {
  totalStudents: number
  activeStudents: number
  inactiveStudents: number
  newStudentsThisMonth: number
}
