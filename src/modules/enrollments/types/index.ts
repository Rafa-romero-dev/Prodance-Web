import type { EnrollmentDTO } from '@/types'

export interface CreateEnrollmentInput {
  studentId: string
  classId: string
  studentCycleId: string
  notes?: string
}

export interface EnrollmentFilters {
  status?: 'PENDING_PAYMENT' | 'ACTIVE' | 'BLOCKED_RECOVERY' | 'COMPLETED' | 'CANCELLED'
  studentId?: string
  classId?: string
  studentCycleId?: string
}

export interface EnrollmentWithRelations extends EnrollmentDTO {
  student?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  class?: {
    id: string
    name: string
    type: 'REGULAR' | 'COMPLEMENTARY'
    level: string | null
  }
}

export interface ActiveEnrollmentsCount {
  regularCount: number
  complementaryCount: number
  total: number
}
