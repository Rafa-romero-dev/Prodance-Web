import { AttendanceService } from '../services/attendanceService'
import { RecoveryService } from '@/modules/recovery/services/recoveryService'
import type { ConsecutiveAbsenceCheckResult } from '../types'

/**
 * Detect consecutive absences and trigger recovery generation
 * Business Rule: ABSENT + ABSENT (consecutive) = Generate Recovery
 */
export async function detectAndHandleConsecutiveAbsences(
  enrollmentId: string,
  teacherId: string,
  administratorId: string
): Promise<{
  detected: boolean
  recoveryId?: string
  error?: string | null
}> {
  try {
    const attendanceService = new AttendanceService()
    const recoveryService = new RecoveryService()

    // Check for consecutive absences
    const checkResult = await attendanceService.checkConsecutiveAbsences(enrollmentId)

    // Only generate recovery on 2nd consecutive absence
    if (!checkResult.hasConsecutiveAbsences || checkResult.absenceCount < 2) {
      return {
        detected: false,
      }
    }

    // Generate recovery
    const result = await recoveryService.generateRecovery(
      enrollmentId,
      teacherId,
      administratorId
    )

    if (!result.success || !result.data) {
      return {
        detected: true,
        error: result.error?.message || 'Unknown error',
      }
    }

    return {
      detected: true,
      recoveryId: result.data.recovery.id,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      detected: false,
      error: `Error checking consecutive absences: ${message}`,
    }
  }
}

/**
 * Reset consecutive absence counter for an enrollment
 * Business Rule: Counter resets on Present attendance or Completed recovery
 * Note: This is implicit in our implementation - we check recent records
 * and stop counting when we hit a Present or completed recovery
 */
export async function resetConsecutiveAbsenceCounter(
  enrollmentId: string
): Promise<{
  reset: boolean
  error?: string
}> {
  try {
    // The counter is reset automatically by checking recent attendance
    // When we register a PRESENT attendance, the counter is implicitly reset
    // because checkConsecutiveAbsences checks only continuous ABSENT records

    return {
      reset: true,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      reset: false,
      error: message,
    }
  }
}
