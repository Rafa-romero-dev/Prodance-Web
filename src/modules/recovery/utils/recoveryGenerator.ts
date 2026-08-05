import { prisma } from '@/lib/prisma'
import { BusinessRuleError } from '@/lib/errors'
import type { Prisma } from '@prisma/client'
import type { RecoveryDTO } from '../types'

/**
 * Settings for recovery charges - should be configurable
 * For now, hardcoded. In future, fetch from academy settings
 */
export const RECOVERY_FEE = 1500 // $15.00 in cents

/**
 * Generate a recovery charge in the database.
 * Business Rule: Recovery MUST generate a charge.
 *
 * recoveryId is optional because Recovery.chargeId is a required FK to
 * Charge — the charge must exist before the recovery row can reference it.
 * Pass a transaction client when calling this as part of a larger
 * transaction (e.g. recovery generation), so the charge insert rolls back
 * with everything else on failure.
 */
export async function generateRecoveryCharge(
  studentId: string,
  enrollmentId: string,
  recoveryId: string | undefined,
  administratorId: string,
  client: Prisma.TransactionClient | typeof prisma = prisma
): Promise<string> {
  try {
    const charge = await client.charge.create({
      data: {
        studentId,
        enrollmentId,
        recoveryId,
        type: 'RECOVERY',
        status: 'PENDING',
        description: `Recovery Lesson - Required after consecutive absences`,
        amount: RECOVERY_FEE,
        remainingAmount: RECOVERY_FEE,
        createdById: administratorId,
      },
    })

    return charge.id
  } catch (error) {
    throw new BusinessRuleError(
      'RECOVERY_CHARGE_CREATION_FAILED',
      'Failed to create recovery charge',
      { error, studentId, enrollmentId }
    )
  }
}

/**
 * Check if a recovery already exists for this enrollment
 * Business Rule: Prevent duplicate recovery generation
 */
export async function hasActiveRecovery(enrollmentId: string): Promise<boolean> {
  try {
    const recovery = await prisma.recovery.findFirst({
      where: {
        enrollmentId,
        status: { in: ['PENDING_PAYMENT', 'READY_TO_SCHEDULE'] },
      },
    })

    return !!recovery
  } catch (error) {
    throw new BusinessRuleError(
      'RECOVERY_CHECK_FAILED',
      'Failed to check for existing recovery',
      { error, enrollmentId }
    )
  }
}

/**
 * Validate recovery prerequisites
 */
export async function validateRecoveryPrerequisites(
  enrollmentId: string
): Promise<{
  valid: boolean
  errors: string[]
}> {
  const errors: string[] = []

  try {
    // Check enrollment exists and is not already completed/cancelled
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: { status: true, classId: true, studentId: true },
    })

    if (!enrollment) {
      errors.push('Enrollment not found')
      return { valid: false, errors }
    }

    if (enrollment.status === 'COMPLETED' || enrollment.status === 'CANCELLED') {
      errors.push('Cannot create recovery for completed or cancelled enrollment')
      return { valid: false, errors }
    }

    // Check class exists
    const classExists = await prisma.class.findUnique({
      where: { id: enrollment.classId },
      select: { id: true },
    })

    if (!classExists) {
      errors.push('Class not found')
      return { valid: false, errors }
    }

    // Check student exists
    const studentExists = await prisma.student.findUnique({
      where: { id: enrollment.studentId },
      select: { id: true },
    })

    if (!studentExists) {
      errors.push('Student not found')
      return { valid: false, errors }
    }

    return { valid: true, errors: [] }
  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { valid: false, errors }
  }
}
