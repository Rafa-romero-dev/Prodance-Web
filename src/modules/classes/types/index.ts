import type { ClassDTO } from '@/types'

export interface CreateClassInput {
  name: string
  type: 'REGULAR' | 'COMPLEMENTARY'
  level?: string
  capacity: number
  administratorId: string
  weekday: string
  startTime: string
  endTime: string
}

export interface UpdateClassInput {
  name?: string
  level?: string
  capacity?: number
  administratorId?: string
}

export interface ClassWithSchedule extends ClassDTO {
  currentSchedule?: {
    id: string
    weekday: string
    startTime: string
    endTime: string
    effectiveFrom: Date
    effectiveUntil: Date | null
  }
}

export interface ScheduleInfo {
  id: string
  classId: string
  weekday: string
  startTime: string
  endTime: string
  effectiveFrom: Date
  effectiveUntil: Date | null
  isCurrent: boolean
}

export interface ClassFilters {
  type?: 'REGULAR' | 'COMPLEMENTARY'
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  administratorId?: string
  level?: string
}

export interface ClassWithEnrollmentCount extends ClassDTO {
  enrollmentCount: number
}
