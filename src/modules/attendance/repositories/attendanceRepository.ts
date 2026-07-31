import { BaseRepository } from '@/lib/baseRepository'
import { BusinessRuleError } from '@/lib/errors'
import type { AttendanceDTO, AttendanceSessionDTO } from '../types'

export class AttendanceRepository extends BaseRepository {
  // Create an attendance session
  async createSession(
    classId: string,
    scheduleVersionId: string,
    sessionDate: Date,
    createdById: string,
    notes?: string
  ): Promise<AttendanceSessionDTO> {
    try {
      const session = await this.db.attendanceSession.create({
        data: {
          classId,
          scheduleVersionId,
          sessionDate,
          status: 'SCHEDULED',
          createdById,
          notes: notes || null,
        },
      })

      return this.mapSessionToDTO(session)
    } catch (error) {
      this.handlePrismaError(error, 'createSession')
    }
  }

  // Get active enrollments for a class
  async getActiveEnrollmentsForClass(classId: string): Promise<any[]> {
    try {
      const enrollments = await this.db.enrollment.findMany({
        where: {
          classId,
          status: { in: ['ACTIVE', 'PENDING_PAYMENT'] },
        },
        select: {
          id: true,
          studentId: true,
          status: true,
        },
      })

      return enrollments
    } catch (error) {
      this.handlePrismaError(error, 'getActiveEnrollmentsForClass')
    }
  }

  // Auto-create attendance records for all active enrollments
  async createAttendanceRecordsForSession(
    sessionId: string,
    enrollments: Array<{ id: string }>,
    registeredById: string
  ): Promise<AttendanceDTO[]> {
    try {
      return await this.withTransaction(async (tx) => {
        const created: AttendanceDTO[] = []

        for (const enrollment of enrollments) {
          const attendance = await tx.attendance.create({
            data: {
              attendanceSessionId: sessionId,
              enrollmentId: enrollment.id,
              status: 'ABSENT',
              isLate: false,
              registeredById,
            },
          })

          created.push(this.mapAttendanceToDTO(attendance))
        }

        return created
      })
    } catch (error) {
      this.handlePrismaError(error, 'createAttendanceRecordsForSession')
    }
  }

  // Register attendance for a single enrollment
  async registerAttendance(
    sessionId: string,
    enrollmentId: string,
    status: 'PRESENT' | 'ABSENT',
    registeredById: string,
    isLate: boolean = false,
    minutesLate?: number,
    observation?: string
  ): Promise<AttendanceDTO> {
    try {
      // Check for existing attendance
      const existing = await this.db.attendance.findUnique({
        where: {
          attendanceSessionId_enrollmentId: {
            attendanceSessionId: sessionId,
            enrollmentId,
          },
        },
      })

      if (existing) {
        throw new BusinessRuleError(
          'ATTENDANCE_ALREADY_REGISTERED',
          'Attendance already registered for this session',
          { sessionId, enrollmentId }
        )
      }

      const attendance = await this.db.attendance.create({
        data: {
          attendanceSessionId: sessionId,
          enrollmentId,
          status,
          isLate,
          minutesLate: minutesLate || null,
          observation: observation || null,
          registeredById,
        },
      })

      return this.mapAttendanceToDTO(attendance)
    } catch (error) {
      this.handlePrismaError(error, 'registerAttendance')
    }
  }

  // Update attendance record
  async updateAttendance(
    attendanceId: string,
    status: 'PRESENT' | 'ABSENT',
    updatedById: string,
    isLate: boolean = false,
    minutesLate?: number,
    observation?: string
  ): Promise<AttendanceDTO> {
    try {
      const attendance = await this.db.attendance.update({
        where: { id: attendanceId },
        data: {
          status,
          isLate,
          minutesLate: minutesLate || null,
          observation: observation || null,
          updatedById,
          updatedAt: new Date(),
        },
      })

      return this.mapAttendanceToDTO(attendance)
    } catch (error) {
      this.handlePrismaError(error, 'updateAttendance')
    }
  }

  // Get attendance by ID
  async getAttendanceById(attendanceId: string): Promise<AttendanceDTO | null> {
    try {
      const attendance = await this.db.attendance.findUnique({
        where: { id: attendanceId },
      })

      return attendance ? this.mapAttendanceToDTO(attendance) : null
    } catch (error) {
      this.handlePrismaError(error, 'getAttendanceById')
    }
  }

  // Get session by ID
  async getSessionById(sessionId: string): Promise<AttendanceSessionDTO | null> {
    try {
      const session = await this.db.attendanceSession.findUnique({
        where: { id: sessionId },
      })

      return session ? this.mapSessionToDTO(session) : null
    } catch (error) {
      this.handlePrismaError(error, 'getSessionById')
    }
  }

  // Get enrollments for a session
  async getAttendancesForSession(sessionId: string): Promise<AttendanceDTO[]> {
    try {
      const attendances = await this.db.attendance.findMany({
        where: { attendanceSessionId: sessionId },
      })

      return attendances.map((a) => this.mapAttendanceToDTO(a))
    } catch (error) {
      this.handlePrismaError(error, 'getAttendancesForSession')
    }
  }

  // Get attendance history for enrollment (for consecutive absence detection)
  async getRecentAttendancesForEnrollment(
    enrollmentId: string,
    limit: number = 5
  ): Promise<
    Array<{
      id: string
      status: string
      sessionDate: Date
      isCancelled: boolean
    }>
  > {
    try {
      const attendances = await this.db.attendance.findMany({
        where: { enrollmentId },
        include: {
          attendanceSession: {
            select: {
              sessionDate: true,
              status: true,
            },
          },
        },
        orderBy: {
          attendanceSession: {
            sessionDate: 'desc',
          },
        },
        take: limit,
      })

      return attendances.map((a) => ({
        id: a.id,
        status: a.status,
        sessionDate: a.attendanceSession.sessionDate,
        isCancelled: a.attendanceSession.status === 'CANCELLED',
      }))
    } catch (error) {
      this.handlePrismaError(error, 'getRecentAttendancesForEnrollment')
    }
  }

  // Check if enrollment is blocked
  async isEnrollmentBlocked(enrollmentId: string): Promise<boolean> {
    try {
      const enrollment = await this.db.enrollment.findUnique({
        where: { id: enrollmentId },
        select: { status: true },
      })

      return enrollment?.status === 'BLOCKED_RECOVERY'
    } catch (error) {
      this.handlePrismaError(error, 'isEnrollmentBlocked')
    }
  }

  // Private helper: Map attendance record to DTO
  private mapAttendanceToDTO(record: any): AttendanceDTO {
    return {
      id: record.id,
      attendanceSessionId: record.attendanceSessionId,
      enrollmentId: record.enrollmentId,
      status: record.status,
      isLate: record.isLate,
      minutesLate: record.minutesLate,
      observation: record.observation,
      registeredById: record.registeredById,
      registeredAt: record.registeredAt,
      updatedById: record.updatedById,
      updatedAt: record.updatedAt,
    }
  }

  // Private helper: Map session record to DTO
  private mapSessionToDTO(record: any): AttendanceSessionDTO {
    return {
      id: record.id,
      classId: record.classId,
      scheduleVersionId: record.scheduleVersionId,
      sessionDate: record.sessionDate,
      status: record.status,
      createdById: record.createdById,
      notes: record.notes,
      createdAt: record.createdAt,
    }
  }
}
