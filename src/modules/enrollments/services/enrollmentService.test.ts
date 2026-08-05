import { describe, it, expect, beforeEach } from 'vitest'
import { EnrollmentService } from './enrollmentService'
import { EnrollmentRepository } from '../repositories/enrollmentRepository'
import { resetDb, testDb } from '@/test/db'
import {
  createTestAdministrator,
  createTestStudent,
  createTestStudentCycle,
  createTestClass,
} from '@/test/fixtures'

describe('EnrollmentService.createEnrollment', () => {
  let service: EnrollmentService
  let administratorId: string
  let studentId: string
  let studentCycleId: string

  beforeEach(async () => {
    await resetDb()
    service = new EnrollmentService(new EnrollmentRepository())
    administratorId = (await createTestAdministrator()).id
    const student = await createTestStudent()
    studentId = student.id
    studentCycleId = (await createTestStudentCycle(studentId)).id
  })

  it('should_create_an_enrollment_with_a_monthly_charge_for_the_first_class', async () => {
    const regularClass = await createTestClass(administratorId, { type: 'REGULAR' })

    const result = await service.createEnrollment(
      { studentId, classId: regularClass.id, studentCycleId },
      administratorId
    )

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data!.status).toBe('PENDING_PAYMENT')

    const charge = await testDb.charge.findFirstOrThrow({
      where: { enrollmentId: result.data!.id },
    })
    expect(charge.type).toBe('MONTHLY')
    expect(charge.amount).toBe(1500) // base price for first class
  })

  it('should_charge_the_additional_class_price_for_a_second_complementary_class', async () => {
    const regular = await createTestClass(administratorId, { type: 'REGULAR' })
    const complementary = await createTestClass(administratorId, { type: 'COMPLEMENTARY' })

    await service.createEnrollment({ studentId, classId: regular.id, studentCycleId }, administratorId)
    const second = await service.createEnrollment(
      { studentId, classId: complementary.id, studentCycleId },
      administratorId
    )

    expect(second.success).toBe(true)
    if (!second.success) return

    const charge = await testDb.charge.findFirstOrThrow({
      where: { enrollmentId: second.data!.id },
    })
    expect(charge.amount).toBe(2000) // $15 base + $5 for the 2nd class
  })

  it('should_block_a_second_regular_enrollment', async () => {
    const firstRegular = await createTestClass(administratorId, { type: 'REGULAR', name: 'Ballet 1' })
    const secondRegular = await createTestClass(administratorId, { type: 'REGULAR', name: 'Ballet 2' })

    const first = await service.createEnrollment(
      { studentId, classId: firstRegular.id, studentCycleId },
      administratorId
    )
    expect(first.success).toBe(true)

    const second = await service.createEnrollment(
      { studentId, classId: secondRegular.id, studentCycleId },
      administratorId
    )

    expect(second.success).toBe(false)
    if (second.success) return
    expect((second.error as { code?: string }).code).toBe('ENROLLMENT_ALREADY_ACTIVE')
  })

  it('should_allow_unlimited_complementary_enrollments', async () => {
    const compA = await createTestClass(administratorId, { type: 'COMPLEMENTARY', name: 'Jazz' })
    const compB = await createTestClass(administratorId, { type: 'COMPLEMENTARY', name: 'Contemporary' })

    const first = await service.createEnrollment(
      { studentId, classId: compA.id, studentCycleId },
      administratorId
    )
    const second = await service.createEnrollment(
      { studentId, classId: compB.id, studentCycleId },
      administratorId
    )

    expect(first.success).toBe(true)
    expect(second.success).toBe(true)
  })
})

describe('EnrollmentService.blockEnrollment / unblockEnrollment', () => {
  let service: EnrollmentService
  let administratorId: string

  beforeEach(async () => {
    await resetDb()
    service = new EnrollmentService(new EnrollmentRepository())
    administratorId = (await createTestAdministrator()).id
  })

  it('should_block_and_unblock_an_enrollment', async () => {
    const student = await createTestStudent()
    const cycle = await createTestStudentCycle(student.id)
    const regularClass = await createTestClass(administratorId, { type: 'REGULAR' })

    const created = await service.createEnrollment(
      { studentId: student.id, classId: regularClass.id, studentCycleId: cycle.id },
      administratorId
    )
    if (!created.success) throw new Error('setup failed')

    const blocked = await service.blockEnrollment(created.data!.id, administratorId)
    expect(blocked.success && blocked.data!.status).toBe('BLOCKED_RECOVERY')

    const unblocked = await service.unblockEnrollment(created.data!.id, administratorId)
    expect(unblocked.success && unblocked.data!.status).toBe('ACTIVE')
  })

  it('should_fail_to_block_a_nonexistent_enrollment', async () => {
    const result = await service.blockEnrollment('does-not-exist', administratorId)
    expect(result.success).toBe(false)
    if (result.success) return
    expect((result.error as { code?: string }).code).toBe('ENROLLMENT_NOT_FOUND')
  })
})
