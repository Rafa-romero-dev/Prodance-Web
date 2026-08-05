import { describe, it, expect, beforeEach } from 'vitest'
import { BillingService } from './billingService'
import { resetDb, testDb } from '@/test/db'
import { createTestAdministrator, createTestStudent, createTestStudentCycle, createTestClass } from '@/test/fixtures'

async function createActiveEnrollment(
  administratorId: string,
  studentId: string,
  studentCycleId: string,
  classId: string
) {
  return testDb.enrollment.create({
    data: { studentId, classId, studentCycleId, createdById: administratorId, status: 'ACTIVE' },
  })
}

describe('BillingService.generateMonthlyCharges', () => {
  let service: BillingService
  let administratorId: string

  beforeEach(async () => {
    await resetDb()
    service = new BillingService()
    administratorId = (await createTestAdministrator()).id
  })

  it('should_generate_a_monthly_charge_for_each_active_student', async () => {
    const student = await createTestStudent()
    const cycle = await createTestStudentCycle(student.id)
    const cls = await createTestClass(administratorId)
    await createActiveEnrollment(administratorId, student.id, cycle.id, cls.id)

    const result = await service.generateMonthlyCharges('2026-08', administratorId)

    expect(result.success).toBe(true)
    expect(result.data!.chargesGenerated).toBe(1)
    expect(result.data!.studentsProcessed).toBe(1)

    const charge = await testDb.charge.findFirstOrThrow({
      where: { studentId: student.id, type: 'MONTHLY' },
    })
    expect(charge.amount).toBe(1500)
    expect(charge.createdById).toBe(administratorId)
  })

  it('should_charge_more_for_a_student_with_multiple_active_classes', async () => {
    const student = await createTestStudent()
    const cycle = await createTestStudentCycle(student.id)
    const classA = await createTestClass(administratorId, { type: 'REGULAR' })
    const classB = await createTestClass(administratorId, { type: 'COMPLEMENTARY' })
    await createActiveEnrollment(administratorId, student.id, cycle.id, classA.id)
    await createActiveEnrollment(administratorId, student.id, cycle.id, classB.id)

    await service.generateMonthlyCharges('2026-08', administratorId)

    const charge = await testDb.charge.findFirstOrThrow({
      where: { studentId: student.id, type: 'MONTHLY' },
    })
    expect(charge.amount).toBe(2000)
  })

  it('should_not_double_charge_a_student_for_the_same_month', async () => {
    const student = await createTestStudent()
    const cycle = await createTestStudentCycle(student.id)
    const cls = await createTestClass(administratorId)
    await createActiveEnrollment(administratorId, student.id, cycle.id, cls.id)

    await service.generateMonthlyCharges('2026-08', administratorId)
    const second = await service.generateMonthlyCharges('2026-08', administratorId)

    expect(second.data!.chargesGenerated).toBe(0)
    const charges = await testDb.charge.findMany({
      where: { studentId: student.id, type: 'MONTHLY' },
    })
    expect(charges).toHaveLength(1)
  })

  it('should_skip_a_student_with_no_active_enrollments', async () => {
    await createTestStudent() // no enrollment at all

    const result = await service.generateMonthlyCharges('2026-08', administratorId)

    expect(result.success).toBe(true)
    expect(result.data!.studentsProcessed).toBe(0)
    expect(result.data!.chargesGenerated).toBe(0)
  })

  it('should_reject_an_invalid_month_format', async () => {
    const result = await service.generateMonthlyCharges('not-a-month', administratorId)
    expect(result.success).toBe(false)
    if (result.success) return
    expect((result.error as { code?: string }).code).toBe('INVALID_MONTH_FORMAT')
  })
})
