import { describe, it, expect, beforeEach } from 'vitest'
import { AttendanceService } from './attendanceService'
import { AttendanceRepository } from '../repositories/attendanceRepository'
import { RecoveryService } from '@/modules/recovery/services/recoveryService'
import { RecoveryRepository } from '@/modules/recovery/repositories/recoveryRepository'
import { detectAndHandleConsecutiveAbsences } from '../utils/consecutiveAbsenceDetector'
import { resetDb, testDb } from '@/test/db'
import { createTestAdministrator, createTestStudent, createTestStudentCycle, createTestClass } from '@/test/fixtures'

async function createEnrollment(
  administratorId: string,
  studentId: string,
  studentCycleId: string,
  classId: string
) {
  return testDb.enrollment.create({
    data: {
      studentId,
      classId,
      studentCycleId,
      createdById: administratorId,
      status: 'ACTIVE',
    },
  })
}

async function createSession(classId: string, daysAgo: number, administratorId: string) {
  const schedule = await testDb.scheduleVersion.create({
    data: {
      classId,
      weekday: 'Monday',
      startTime: '10:00',
      endTime: '11:00',
      effectiveFrom: new Date(),
      isCurrent: true,
    },
  })
  const sessionDate = new Date()
  sessionDate.setDate(sessionDate.getDate() - daysAgo)
  return testDb.attendanceSession.create({
    data: {
      classId,
      scheduleVersionId: schedule.id,
      sessionDate,
      status: 'CLOSED',
      createdById: administratorId,
    },
  })
}

describe('AttendanceService.registerAttendance', () => {
  let service: AttendanceService
  let administratorId: string
  let enrollmentId: string
  let sessionId: string

  beforeEach(async () => {
    await resetDb()
    service = new AttendanceService(new AttendanceRepository())
    administratorId = (await createTestAdministrator()).id
    const student = await createTestStudent()
    const cycle = await createTestStudentCycle(student.id)
    const cls = await createTestClass(administratorId)
    const enrollment = await createEnrollment(administratorId, student.id, cycle.id, cls.id)
    enrollmentId = enrollment.id
    const session = await createSession(cls.id, 0, administratorId)
    sessionId = session.id
  })

  it('should_register_a_present_attendance', async () => {
    const result = await service.registerAttendance(sessionId, enrollmentId, 'PRESENT', administratorId)
    expect(result.success).toBe(true)
    expect(result.data!.status).toBe('PRESENT')
  })

  it('should_reject_marking_a_blocked_enrollment_as_present', async () => {
    await testDb.enrollment.update({
      where: { id: enrollmentId },
      data: { status: 'BLOCKED_RECOVERY' },
    })

    const result = await service.registerAttendance(sessionId, enrollmentId, 'PRESENT', administratorId)

    expect(result.success).toBe(false)
    if (result.success) return
    expect((result.error as { code?: string }).code).toBe('ENROLLMENT_BLOCKED')
  })

  it('should_reject_registering_attendance_twice_for_the_same_session', async () => {
    await service.registerAttendance(sessionId, enrollmentId, 'PRESENT', administratorId)
    const second = await service.registerAttendance(sessionId, enrollmentId, 'ABSENT', administratorId)

    expect(second.success).toBe(false)
  })
})

describe('AttendanceService.getAttendanceHistory', () => {
  it('should_return_the_attendance_history_for_an_enrollment', async () => {
    await resetDb()
    const service = new AttendanceService(new AttendanceRepository())
    const administratorId = (await createTestAdministrator()).id
    const student = await createTestStudent()
    const cycle = await createTestStudentCycle(student.id)
    const cls = await createTestClass(administratorId)
    const enrollment = await createEnrollment(administratorId, student.id, cycle.id, cls.id)
    const session = await createSession(cls.id, 0, administratorId)

    await service.registerAttendance(session.id, enrollment.id, 'PRESENT', administratorId)

    // Regression test: getAttendanceHistory used to always return an empty
    // array regardless of what was fetched (data: [] instead of data: attendances).
    const result = await service.getAttendanceHistory(enrollment.id)
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
  })
})

describe('consecutive absence detection triggers recovery', () => {
  let administratorId: string
  let teacherId: string
  let studentId: string
  let enrollmentId: string
  let classId: string
  let attendanceService: AttendanceService

  beforeEach(async () => {
    await resetDb()
    attendanceService = new AttendanceService(new AttendanceRepository())

    const admin = await createTestAdministrator()
    administratorId = admin.id
    teacherId = admin.id // teachers are administrators (Decision 002)

    const student = await createTestStudent()
    studentId = student.id
    const cycle = await createTestStudentCycle(studentId)
    const cls = await createTestClass(administratorId)
    classId = cls.id

    const enrollment = await createEnrollment(administratorId, studentId, cycle.id, classId)
    enrollmentId = enrollment.id
  })

  it('should_not_trigger_recovery_after_a_single_absence', async () => {
    const session = await createSession(classId, 0, administratorId)
    await attendanceService.registerAttendance(session.id, enrollmentId, 'ABSENT', administratorId)

    const result = await detectAndHandleConsecutiveAbsences(enrollmentId, teacherId, administratorId)

    expect(result.detected).toBe(false)
    const enrollment = await testDb.enrollment.findUniqueOrThrow({ where: { id: enrollmentId } })
    expect(enrollment.status).toBe('ACTIVE')
  })

  it('should_generate_a_recovery_and_block_the_enrollment_after_two_consecutive_absences', async () => {
    const firstSession = await createSession(classId, 7, administratorId)
    const secondSession = await createSession(classId, 0, administratorId)

    await attendanceService.registerAttendance(firstSession.id, enrollmentId, 'ABSENT', administratorId)
    await attendanceService.registerAttendance(secondSession.id, enrollmentId, 'ABSENT', administratorId)

    const result = await detectAndHandleConsecutiveAbsences(enrollmentId, teacherId, administratorId)

    expect(result.detected).toBe(true)
    expect(result.recoveryId).toBeDefined()

    const enrollment = await testDb.enrollment.findUniqueOrThrow({ where: { id: enrollmentId } })
    expect(enrollment.status).toBe('BLOCKED_RECOVERY')

    const recovery = await testDb.recovery.findUniqueOrThrow({ where: { id: result.recoveryId! } })
    expect(recovery.status).toBe('PENDING_PAYMENT')

    const charge = await testDb.charge.findFirstOrThrow({ where: { recoveryId: recovery.id } })
    expect(charge.type).toBe('RECOVERY')
    expect(charge.amount).toBe(1500)
  })

  it('should_not_generate_a_second_recovery_if_one_is_already_active', async () => {
    const firstSession = await createSession(classId, 7, administratorId)
    const secondSession = await createSession(classId, 0, administratorId)
    await attendanceService.registerAttendance(firstSession.id, enrollmentId, 'ABSENT', administratorId)
    await attendanceService.registerAttendance(secondSession.id, enrollmentId, 'ABSENT', administratorId)
    await detectAndHandleConsecutiveAbsences(enrollmentId, teacherId, administratorId)

    const result = await detectAndHandleConsecutiveAbsences(enrollmentId, teacherId, administratorId)

    expect(result.detected).toBe(true)
    expect(result.error).toMatch(/already exists/i)

    const recoveryCount = await testDb.recovery.count({ where: { enrollmentId } })
    expect(recoveryCount).toBe(1)
  })

  it('should_not_trigger_recovery_when_the_second_absence_is_broken_by_a_present', async () => {
    const first = await createSession(classId, 14, administratorId)
    const middle = await createSession(classId, 7, administratorId)
    const last = await createSession(classId, 0, administratorId)

    await attendanceService.registerAttendance(first.id, enrollmentId, 'ABSENT', administratorId)
    await attendanceService.registerAttendance(middle.id, enrollmentId, 'PRESENT', administratorId)
    await attendanceService.registerAttendance(last.id, enrollmentId, 'ABSENT', administratorId)

    const result = await detectAndHandleConsecutiveAbsences(enrollmentId, teacherId, administratorId)

    expect(result.detected).toBe(false)
  })
})

describe('RecoveryService.completeRecovery', () => {
  it('should_unblock_the_enrollment_when_recovery_completes', async () => {
    await resetDb()
    const attendanceService = new AttendanceService(new AttendanceRepository())
    const recoveryService = new RecoveryService(new RecoveryRepository())

    const admin = await createTestAdministrator()
    const student = await createTestStudent()
    const cycle = await createTestStudentCycle(student.id)
    const cls = await createTestClass(admin.id)
    const enrollment = await createEnrollment(admin.id, student.id, cycle.id, cls.id)

    const firstSession = await createSession(cls.id, 7, admin.id)
    const secondSession = await createSession(cls.id, 0, admin.id)
    await attendanceService.registerAttendance(firstSession.id, enrollment.id, 'ABSENT', admin.id)
    await attendanceService.registerAttendance(secondSession.id, enrollment.id, 'ABSENT', admin.id)

    const generated = await detectAndHandleConsecutiveAbsences(enrollment.id, admin.id, admin.id)
    expect(generated.detected).toBe(true)

    const completed = await recoveryService.completeRecovery(
      generated.recoveryId!,
      new Date(),
      'Recovery lesson attended',
      admin.id
    )

    expect(completed.success).toBe(true)
    expect(completed.data!.status).toBe('COMPLETED')

    const unblockedEnrollment = await testDb.enrollment.findUniqueOrThrow({
      where: { id: enrollment.id },
    })
    expect(unblockedEnrollment.status).toBe('ACTIVE')
  })

  it('should_reject_completing_an_already_completed_recovery', async () => {
    await resetDb()
    const attendanceService = new AttendanceService(new AttendanceRepository())
    const recoveryService = new RecoveryService(new RecoveryRepository())

    const admin = await createTestAdministrator()
    const student = await createTestStudent()
    const cycle = await createTestStudentCycle(student.id)
    const cls = await createTestClass(admin.id)
    const enrollment = await createEnrollment(admin.id, student.id, cycle.id, cls.id)
    const firstSession = await createSession(cls.id, 7, admin.id)
    const secondSession = await createSession(cls.id, 0, admin.id)
    await attendanceService.registerAttendance(firstSession.id, enrollment.id, 'ABSENT', admin.id)
    await attendanceService.registerAttendance(secondSession.id, enrollment.id, 'ABSENT', admin.id)
    const generated = await detectAndHandleConsecutiveAbsences(enrollment.id, admin.id, admin.id)

    await recoveryService.completeRecovery(generated.recoveryId!, new Date(), undefined, admin.id)
    const secondCompletion = await recoveryService.completeRecovery(
      generated.recoveryId!,
      new Date(),
      undefined,
      admin.id
    )

    expect(secondCompletion.success).toBe(false)
    if (secondCompletion.success) return
    expect((secondCompletion.error as { code?: string }).code).toBe('RECOVERY_ALREADY_COMPLETED')
  })
})
