import { describe, it, expect, beforeEach } from 'vitest'
import { StudentService } from './studentService'
import { StudentRepository } from '../repositories/studentRepository'
import { resetDb, testDb } from '@/test/db'
import { createTestAdministrator } from '@/test/fixtures'

describe('StudentService.createStudent', () => {
  let service: StudentService
  let administratorId: string

  beforeEach(async () => {
    await resetDb()
    service = new StudentService(new StudentRepository())
    administratorId = (await createTestAdministrator()).id
  })

  it('should_create_a_student_with_an_active_cycle_and_enrollment_charge', async () => {
    const result = await service.createStudent(
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice-integration@example.com',
        phone: '555-1234',
      },
      administratorId
    )

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.data!.status).toBe('ACTIVE')

    const cycle = await testDb.studentCycle.findFirst({ where: { studentId: result.data!.id } })
    expect(cycle?.status).toBe('ACTIVE')

    const charge = await testDb.charge.findFirst({ where: { studentId: result.data!.id } })
    expect(charge?.type).toBe('ENROLLMENT')
  })

  it('should_reject_a_duplicate_email', async () => {
    await service.createStudent(
      { firstName: 'Alice', lastName: 'Johnson', email: 'dup@example.com', phone: '555-1234' },
      administratorId
    )

    const result = await service.createStudent(
      { firstName: 'Alice', lastName: 'Clone', email: 'dup@example.com', phone: '555-9999' },
      administratorId
    )

    expect(result.success).toBe(false)
    if (result.success) return
    expect((result.error as { code?: string }).code).toBe('STUDENT_EMAIL_EXISTS')
  })
})

describe('StudentService.deactivateStudent', () => {
  let service: StudentService
  let administratorId: string

  beforeEach(async () => {
    await resetDb()
    service = new StudentService(new StudentRepository())
    administratorId = (await createTestAdministrator()).id
  })

  it('should_deactivate_student_and_close_active_enrollments', async () => {
    const createResult = await service.createStudent(
      { firstName: 'Bob', lastName: 'Smith', email: 'bob-integration@example.com', phone: '555-1111' },
      administratorId
    )
    if (!createResult.success) throw new Error('setup failed')
    const studentId = createResult.data!.id

    const cycle = await testDb.studentCycle.findFirstOrThrow({ where: { studentId } })
    const testClass = await testDb.class.create({
      data: { name: 'Ballet', type: 'REGULAR', capacity: 20, status: 'ACTIVE', administratorId },
    })
    const enrollment = await testDb.enrollment.create({
      data: {
        studentId,
        classId: testClass.id,
        studentCycleId: cycle.id,
        createdById: administratorId,
        status: 'ACTIVE',
      },
    })

    const result = await service.deactivateStudent(studentId, administratorId)

    expect(result.success).toBe(true)
    expect(result.success && result.data!.status).toBe('INACTIVE')

    const closedEnrollment = await testDb.enrollment.findUniqueOrThrow({
      where: { id: enrollment.id },
    })
    expect(closedEnrollment.status).toBe('COMPLETED')
    expect(closedEnrollment.endDate).not.toBeNull()
  })

  it('should_fail_for_a_nonexistent_student', async () => {
    const result = await service.deactivateStudent('does-not-exist', administratorId)
    expect(result.success).toBe(false)
    if (result.success) return
    expect((result.error as { code?: string }).code).toBe('STUDENT_NOT_FOUND')
  })
})
