import { prisma } from '@/lib/prisma'
import { BusinessRuleError } from '@/lib/errors'

/**
 * Valid regular class levels in progression order
 */
const REGULAR_LEVELS = [
  'Basic 1',
  'Basic 2',
  'Basic 3',
  'Basic 4',
  'Intermediate 1',
  'Intermediate 2',
  'Intermediate 3',
  'Intermediate 4',
  'Advanced 1',
  'Advanced 2',
  'Advanced 3',
  'Advanced 4',
]

/**
 * Validate that target class is a valid regular class
 */
export async function validateTargetClass(
  targetClassId: string
): Promise<{
  valid: boolean
  error?: string
  classLevel?: string
  isRegular?: boolean
}> {
  try {
    const classRecord = await prisma.class.findUnique({
      where: { id: targetClassId },
      select: {
        type: true,
        level: true,
        status: true,
      },
    })

    if (!classRecord) {
      return {
        valid: false,
        error: 'Target class not found',
      }
    }

    if (classRecord.type !== 'REGULAR') {
      return {
        valid: false,
        error: 'Target class must be a regular class',
        isRegular: false,
      }
    }

    if (classRecord.status !== 'ACTIVE') {
      return {
        valid: false,
        error: 'Target class must be active',
      }
    }

    if (!classRecord.level || !REGULAR_LEVELS.includes(classRecord.level)) {
      return {
        valid: false,
        error: 'Target class has invalid level',
      }
    }

    return {
      valid: true,
      classLevel: classRecord.level,
      isRegular: true,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to validate target class',
    }
  }
}

/**
 * Get all valid regular classes (for re-entry level selection)
 */
export async function getValidRegularClasses(): Promise<
  Array<{
    id: string
    name: string
    level: string
  }>
> {
  try {
    const classes = await prisma.class.findMany({
      where: {
        type: 'REGULAR',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        level: true,
      },
      orderBy: {
        level: 'asc',
      },
    })

    // Filter out classes without a level (should not exist for REGULAR, but being safe)
    return classes.filter((c) => c.level !== null) as Array<{
      id: string
      name: string
      level: string
    }>
  } catch (error) {
    throw new BusinessRuleError(
      'FETCH_CLASSES_FAILED',
      'Failed to fetch valid regular classes',
      { error }
    )
  }
}

/**
 * Validate that the target level represents a valid progression/placement
 * Note: Can be any level (demotion allowed)
 */
export function validateLevelSelection(level: string): {
  valid: boolean
  error?: string
} {
  if (!level || !REGULAR_LEVELS.includes(level)) {
    return {
      valid: false,
      error: `Invalid level. Valid levels are: ${REGULAR_LEVELS.join(', ')}`,
    }
  }

  return { valid: true }
}
