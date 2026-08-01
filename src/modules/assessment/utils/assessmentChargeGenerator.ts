import { prisma } from '@/lib/prisma'
import { BusinessRuleError } from '@/lib/errors'

/**
 * Settings for assessment charges - should be configurable
 * For now, hardcoded. In future, fetch from academy settings
 */
const ASSESSMENT_FEE = 2500 // $25.00 in cents

/**
 * Generate an assessment charge in the database
 * Business Rule: Assessment MUST generate a charge
 */
export async function generateAssessmentCharge(
  studentId: string,
  assessmentId: string,
  administratorId: string
): Promise<string> {
  try {
    const charge = await prisma.charge.create({
      data: {
        studentId,
        assessmentId,
        type: 'LEVEL_ASSESSMENT',
        status: 'PENDING',
        description: `Level Assessment - Required for student re-entry`,
        amount: ASSESSMENT_FEE,
        remainingAmount: ASSESSMENT_FEE,
        createdById: administratorId,
      },
    })

    return charge.id
  } catch (error) {
    throw new BusinessRuleError(
      'ASSESSMENT_CHARGE_CREATION_FAILED',
      'Failed to create assessment charge',
      { error, studentId, assessmentId }
    )
  }
}

/**
 * Validate assessment prerequisites
 */
export async function validateAssessmentPrerequisites(
  studentId: string,
  studentCycleId: string,
  classId: string
): Promise<{
  valid: boolean
  errors: string[]
  isRegularClass?: boolean
}> {
  const errors: string[] = []
  let isRegularClass = false

  try {
    // Check student exists and is INACTIVE
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { status: true },
    })

    if (!student) {
      errors.push('Student not found')
      return { valid: false, errors }
    }

    if (student.status !== 'INACTIVE') {
      errors.push('Student must be inactive to undergo re-entry assessment')
      return { valid: false, errors }
    }

    // Check student cycle exists and belongs to student
    const cycle = await prisma.studentCycle.findUnique({
      where: { id: studentCycleId },
      select: { studentId: true, status: true },
    })

    if (!cycle) {
      errors.push('Student cycle not found')
      return { valid: false, errors }
    }

    if (cycle.studentId !== studentId) {
      errors.push('Student cycle does not belong to this student')
      return { valid: false, errors }
    }

    if (cycle.status !== 'ACTIVE') {
      errors.push('Student cycle must be active')
      return { valid: false, errors }
    }

    // Check class exists and get type
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      select: { type: true, status: true },
    })

    if (!classRecord) {
      errors.push('Class not found')
      return { valid: false, errors }
    }

    if (classRecord.status !== 'ACTIVE') {
      errors.push('Class must be active')
      return { valid: false, errors }
    }

    isRegularClass = classRecord.type === 'REGULAR'

    return { valid: true, errors: [], isRegularClass }
  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return { valid: false, errors }
  }
}

/**
 * Check if assessment is mandatory for this class type
 */
export function isAssessmentMandatory(classType: 'REGULAR' | 'COMPLEMENTARY'): boolean {
  return classType === 'REGULAR'
}
