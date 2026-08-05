import { prisma } from '@/lib/prisma'

// Deletes all rows in FK-safe order (children before the parents they
// reference) so each test starts from a clean state, per TESTING.md's
// "DATABASE FIXTURES: Every test starts from a clean state."
export async function resetDb() {
  await prisma.receiptAllocation.deleteMany()
  await prisma.receipt.deleteMany()
  await prisma.recovery.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.attendanceSession.deleteMany()
  await prisma.charge.deleteMany()
  await prisma.levelAssessment.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.scheduleVersion.deleteMany()
  await prisma.class.deleteMany()
  await prisma.studentCycle.deleteMany()
  await prisma.student.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.administrator.deleteMany()
}

export { prisma as testDb }
