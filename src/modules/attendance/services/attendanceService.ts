import type { ServiceResult, DomainEvent } from '@/types'
import { BusinessRuleError, AttendanceError } from '@/lib/errors'
import { getAuditService } from '@/modules/audit/services/auditService'
import { AttendanceRepository } from '../repositories/attendanceRepository'
import type { AttendanceDTO, AttendanceSessionDTO, ConsecutiveAbsenceCheckResult } from '../types'

export class AttendanceService {
  private repository: AttendanceRepository
  private auditService = getAuditService()

  constructor(repository?: AttendanceRepository) {
    this.repository = repository || new AttendanceRepository()
  }

  /**
   * Create an attendance session and auto-register all active enrollments
   * Business Rule: When attendance is opened, auto-create records for ALL active enrollments
   */
  async openAttendanceSession(
    classId: string,
    scheduleVersionId: string,
    sessionDate: Date,
    administratorId: string,
    notes?: string
  ): Promise<ServiceResult<{ session: AttendanceSessionDTO; attendanceCount: number }>> {
    try {
      // Create the session
      const session = await this.repository.createSession(
        classId,
        scheduleVersionId,
        sessionDate,
        administratorId,
        notes
      )

      // Get all active enrollments for this class
      const activeEnrollments = await this.repository.getActiveEnrollmentsForClass(classId)

      if (activeEnrollments.length === 0) {
        await this.auditService.log(
          administratorId,
          'AttendanceSession',
          session.id,
          'AttendanceSessionCreated',
          {
            metadata: {
              classId,
              enrollmentCount: 0,
            },
          }
        )

        return {
          success: true,
          data: { session, attendanceCount: 0 },
        }
      }

      // Auto-create attendance records for all active enrollments
      const attendances = await this.repository.createAttendanceRecordsForSession(
        session.id,
        activeEnrollments,
        administratorId
      )

      // Log the session creation
      await this.auditService.log(
        administratorId,
        'AttendanceSession',
        session.id,
        'AttendanceSessionCreated',
        {
          metadata: {
            classId,
            enrollmentCount: attendances.length,
          },
        }
      )

      return {
        success: true,
        data: { session, attendanceCount: attendances.length },
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const businessError = new BusinessRuleError(
        'ATTENDANCE_ERROR',
        error instanceof Error ? error.message : 'Failed to open attendance session'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Register attendance for a single enrollment
   * Business Rule: Blocked enrollments cannot be marked Present
   */
  async registerAttendance(
    sessionId: string,
    enrollmentId: string,
    status: 'PRESENT' | 'ABSENT',
    administratorId: string,
    isLate: boolean = false,
    minutesLate?: number,
    observation?: string
  ): Promise<ServiceResult<AttendanceDTO>> {
    try {
      // Check if enrollment is blocked
      const isBlocked = await this.repository.isEnrollmentBlocked(enrollmentId)

      if (isBlocked && status === 'PRESENT') {
        throw new AttendanceError(
          'ENROLLMENT_BLOCKED',
          'Cannot mark blocked enrollment as present. Recovery must be completed first.',
          { enrollmentId }
        )
      }

      // Register the attendance
      const attendance = await this.repository.registerAttendance(
        sessionId,
        enrollmentId,
        status,
        administratorId,
        isLate,
        minutesLate,
        observation
      )

      // Log the registration
      await this.auditService.log(
        administratorId,
        'Attendance',
        attendance.id,
        'AttendanceRegistered',
        {
          metadata: {
            enrollmentId,
            status,
            isLate,
          },
        }
      )

      return {
        success: true,
        data: attendance,
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const businessError = new BusinessRuleError(
        'ATTENDANCE_ERROR',
        error instanceof Error ? error.message : 'Failed to register attendance'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Edit existing attendance record
   * Business Rule: Edits create audit records, never delete history
   */
  async editAttendance(
    attendanceId: string,
    status: 'PRESENT' | 'ABSENT',
    updatedById: string,
    isLate: boolean = false,
    minutesLate?: number,
    observation?: string,
    reason?: string
  ): Promise<ServiceResult<AttendanceDTO>> {
    try {
      // Get original attendance to log the change
      const original = await this.repository.getAttendanceById(attendanceId)

      if (!original) {
        throw new AttendanceError('ATTENDANCE_NOT_FOUND', 'Attendance record not found', {
          attendanceId,
        })
      }

      // Update the attendance
      const updated = await this.repository.updateAttendance(
        attendanceId,
        status,
        updatedById,
        isLate,
        minutesLate,
        observation
      )

      // Log the edit with before/after values
      await this.auditService.log(
        updatedById,
        'Attendance',
        attendanceId,
        'AttendanceEdited',
        {
          previousState: {
            status: original.status,
            isLate: original.isLate,
            minutesLate: original.minutesLate,
          },
          newState: {
            status: updated.status,
            isLate: updated.isLate,
            minutesLate: updated.minutesLate,
          },
          metadata: {
            reason,
          },
        }
      )

      return {
        success: true,
        data: updated,
      }
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return {
          success: false,
          error,
        }
      }

      const businessError = new BusinessRuleError(
        'ATTENDANCE_ERROR',
        error instanceof Error ? error.message : 'Failed to edit attendance'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  /**
   * Check for consecutive absences on an enrollment
   * Business Rule: ABSENT + ABSENT = Generate Recovery (independent per enrollment)
   * Reset counter on: Present attendance OR Completed recovery OR Enrollment completion
   */
  async checkConsecutiveAbsences(enrollmentId: string): Promise<ConsecutiveAbsenceCheckResult> {
    try {
      const recentAttendances = await this.repository.getRecentAttendancesForEnrollment(
        enrollmentId,
        5
      )

      // Filter out cancelled sessions
      const validAttendances = recentAttendances.filter((a) => !a.isCancelled)

      if (validAttendances.length < 2) {
        return {
          hasConsecutiveAbsences: false,
          enrollmentId,
          lastAbsenceDate: null,
          secondLastAbsenceDate: null,
          absenceCount: 0,
        }
      }

      // Check the most recent two attendances
      const most_recent = validAttendances[0]
      const second_most_recent = validAttendances[1]

      // Both must be ABSENT and consecutive (no PRESENT between them)
      const hasConsecutiveAbsences = most_recent.status === 'ABSENT' && second_most_recent.status === 'ABSENT'

      // Count consecutive absences from the end
      let absenceCount = 0
      for (const attendance of validAttendances) {
        if (attendance.status === 'ABSENT') {
          absenceCount++
        } else {
          break // Stop counting when we hit a PRESENT
        }
      }

      return {
        hasConsecutiveAbsences,
        enrollmentId,
        lastAbsenceDate: most_recent.sessionDate,
        secondLastAbsenceDate: second_most_recent.sessionDate,
        absenceCount,
      }
    } catch (error) {
      this.log('error', 'Error checking consecutive absences', error)
      return {
        hasConsecutiveAbsences: false,
        enrollmentId,
        lastAbsenceDate: null,
        secondLastAbsenceDate: null,
        absenceCount: 0,
      }
    }
  }

  /**
   * Get attendance history for an enrollment
   */
  async getAttendanceHistory(enrollmentId: string): Promise<ServiceResult<AttendanceDTO[]>> {
    try {
      const attendances = await this.repository.getRecentAttendancesForEnrollment(enrollmentId, 100)

      return {
        success: true,
        data: [],
      }
    } catch (error) {
      const businessError = new BusinessRuleError(
        'ATTENDANCE_ERROR',
        error instanceof Error ? error.message : 'Failed to fetch attendance history'
      )
      return {
        success: false,
        error: businessError,
      }
    }
  }

  private log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    const timestamp = new Date().toISOString()
    const className = this.constructor.name

    if (level === 'info') {
      console.log(`[${timestamp}] [${className}] ${message}`, data)
    } else if (level === 'warn') {
      console.warn(`[${timestamp}] [${className}] ${message}`, data)
    } else {
      console.error(`[${timestamp}] [${className}] ${message}`, data)
    }
  }
}
