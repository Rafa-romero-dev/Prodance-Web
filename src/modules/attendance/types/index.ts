// Attendance Module Types

export type AttendanceDTO = {
  id: string
  attendanceSessionId: string
  enrollmentId: string
  status: 'PRESENT' | 'ABSENT'
  isLate: boolean
  minutesLate: number | null
  observation: string | null
  registeredById: string
  registeredAt: Date
  updatedById: string | null
  updatedAt: Date
}

export type AttendanceSessionDTO = {
  id: string
  classId: string
  scheduleVersionId: string
  sessionDate: Date
  status: 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'CANCELLED'
  createdById: string
  notes: string | null
  createdAt: Date
}

export type CreateAttendanceSessionInput = {
  classId: string
  scheduleVersionId: string
  sessionDate: Date
  createdById: string
  notes?: string
}

export type RegisterAttendanceInput = {
  attendanceSessionId: string
  enrollmentId: string
  status: 'PRESENT' | 'ABSENT'
  isLate?: boolean
  minutesLate?: number
  observation?: string
  registeredById: string
}

export type EditAttendanceInput = {
  attendanceId: string
  status: 'PRESENT' | 'ABSENT'
  isLate?: boolean
  minutesLate?: number
  observation?: string
  updatedById: string
  reason?: string
}

export type ConsecutiveAbsenceCheckResult = {
  hasConsecutiveAbsences: boolean
  enrollmentId: string
  lastAbsenceDate: Date | null
  secondLastAbsenceDate: Date | null
  absenceCount: number
}
