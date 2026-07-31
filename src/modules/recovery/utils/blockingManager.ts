import { prisma } from '@/lib/prisma'
import { BusinessRuleError } from '@/lib/errors'

/**
 * Block an enrollment when recovery is generated
 * Business Rule: Recovery blocks attendance in that enrollment only
 */
export async function blockEnrollment(enrollmentId: string): Promise<void> {
  try {
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'BLOCKED_RECOVERY',
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    throw new BusinessRuleError(
      'ENROLLMENT_BLOCKING_FAILED',
      'Failed to block enrollment for recovery',
      { error, enrollmentId }
    )
  }
}

/**
 * Unblock an enrollment when recovery is completed
 * Business Rule: Return enrollment to ACTIVE state
 */
export async function unblockEnrollment(enrollmentId: string): Promise<void> {
  try {
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    throw new BusinessRuleError(
      'ENROLLMENT_UNBLOCKING_FAILED',
      'Failed to unblock enrollment after recovery completion',
      { error, enrollmentId }
    )
  }
}

/**
 * Check if enrollment is blocked
 */
export async function isEnrollmentBlocked(enrollmentId: string): Promise<boolean> {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { status: true },
    })

    return enrollment?.status === 'BLOCKED_RECOVERY'
  } catch (error) {
    throw new BusinessRuleError(
      'ENROLLMENT_STATUS_CHECK_FAILED',
      'Failed to check enrollment status',
      { error, enrollmentId }
    )
  }
}
