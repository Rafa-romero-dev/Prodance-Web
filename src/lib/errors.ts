export class BusinessRuleError extends Error {
  code: string
  context?: Record<string, unknown>

  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message)
    this.name = 'BusinessRuleError'
    this.code = code
    this.context = context
  }
}

// People Domain Errors
export class StudentNotFoundError extends BusinessRuleError {
  constructor(studentId: string) {
    super('STUDENT_NOT_FOUND', `Student with ID ${studentId} not found`, { studentId })
  }
}

export class AdministratorNotFoundError extends BusinessRuleError {
  constructor(administratorId: string) {
    super('ADMINISTRATOR_NOT_FOUND', `Administrator with ID ${administratorId} not found`, {
      administratorId,
    })
  }
}

export class StudentEmailAlreadyExistsError extends BusinessRuleError {
  constructor(email: string) {
    super('STUDENT_EMAIL_EXISTS', `Student with email ${email} already exists`, { email })
  }
}

export class AdministratorEmailAlreadyExistsError extends BusinessRuleError {
  constructor(email: string) {
    super('ADMIN_EMAIL_EXISTS', `Administrator with email ${email} already exists`, { email })
  }
}

// Academic Domain Errors
export class ClassNotFoundError extends BusinessRuleError {
  constructor(classId: string) {
    super('CLASS_NOT_FOUND', `Class with ID ${classId} not found`, { classId })
  }
}

export class EnrollmentNotFoundError extends BusinessRuleError {
  constructor(enrollmentId: string) {
    super('ENROLLMENT_NOT_FOUND', `Enrollment with ID ${enrollmentId} not found`, {
      enrollmentId,
    })
  }
}

export class EnrollmentAlreadyActiveError extends BusinessRuleError {
  constructor(studentId: string, classId: string) {
    super(
      'ENROLLMENT_ALREADY_ACTIVE',
      `Student already has an active enrollment in this regular class`,
      { studentId, classId }
    )
  }
}

export class StudentCycleNotFoundError extends BusinessRuleError {
  constructor(cycleId: string) {
    super('STUDENT_CYCLE_NOT_FOUND', `Student cycle with ID ${cycleId} not found`, { cycleId })
  }
}

export class AttendanceSessionNotFoundError extends BusinessRuleError {
  constructor(sessionId: string) {
    super('ATTENDANCE_SESSION_NOT_FOUND', `Attendance session with ID ${sessionId} not found`, {
      sessionId,
    })
  }
}

export class AttendanceNotFoundError extends BusinessRuleError {
  constructor(attendanceId: string) {
    super('ATTENDANCE_NOT_FOUND', `Attendance record with ID ${attendanceId} not found`, {
      attendanceId,
    })
  }
}

export class AttendanceAlreadyRegisteredError extends BusinessRuleError {
  constructor(sessionId: string, enrollmentId: string) {
    super(
      'ATTENDANCE_ALREADY_REGISTERED',
      `Attendance already registered for this enrollment in this session`,
      { sessionId, enrollmentId }
    )
  }
}

export class EnrollmentBlockedError extends BusinessRuleError {
  constructor(enrollmentId: string) {
    super(
      'ENROLLMENT_BLOCKED',
      `Enrollment is blocked and student cannot attend. Recovery lesson required.`,
      { enrollmentId }
    )
  }
}

export class RecoveryNotFoundError extends BusinessRuleError {
  constructor(recoveryId: string) {
    super('RECOVERY_NOT_FOUND', `Recovery with ID ${recoveryId} not found`, { recoveryId })
  }
}

export class RecoveryAlreadyExistsError extends BusinessRuleError {
  constructor(enrollmentId: string) {
    super(
      'RECOVERY_ALREADY_EXISTS',
      `A recovery already exists for this enrollment`,
      { enrollmentId }
    )
  }
}

export class RecoveryPaymentRequiredError extends BusinessRuleError {
  constructor(recoveryId: string) {
    super(
      'RECOVERY_PAYMENT_REQUIRED',
      `Recovery payment must be approved before completion`,
      { recoveryId }
    )
  }
}

export class PromotionNotFoundError extends BusinessRuleError {
  constructor(promotionId: string) {
    super('PROMOTION_NOT_FOUND', `Promotion with ID ${promotionId} not found`, { promotionId })
  }
}

export class LevelAssessmentNotFoundError extends BusinessRuleError {
  constructor(assessmentId: string) {
    super(
      'LEVEL_ASSESSMENT_NOT_FOUND',
      `Level assessment with ID ${assessmentId} not found`,
      { assessmentId }
    )
  }
}

export class AssessmentPaymentRequiredError extends BusinessRuleError {
  constructor(assessmentId: string) {
    super(
      'ASSESSMENT_PAYMENT_REQUIRED',
      `Assessment payment must be approved before completion`,
      { assessmentId }
    )
  }
}

// Financial Domain Errors
export class ChargeNotFoundError extends BusinessRuleError {
  constructor(chargeId: string) {
    super('CHARGE_NOT_FOUND', `Charge with ID ${chargeId} not found`, { chargeId })
  }
}

export class ReceiptNotFoundError extends BusinessRuleError {
  constructor(receiptId: string) {
    super('RECEIPT_NOT_FOUND', `Receipt with ID ${receiptId} not found`, { receiptId })
  }
}

export class InvalidPaymentAllocationError extends BusinessRuleError {
  constructor(receiptId: string, chargeId: string, reason: string) {
    super(
      'INVALID_PAYMENT_ALLOCATION',
      `Cannot allocate payment from receipt to charge: ${reason}`,
      { receiptId, chargeId }
    )
  }
}

export class AllocationAmountExceedsReceiptError extends BusinessRuleError {
  constructor(receiptId: string, requestedAmount: number, availableAmount: number) {
    super(
      'ALLOCATION_EXCEEDS_RECEIPT',
      `Allocation amount exceeds available receipt balance`,
      { receiptId, requestedAmount, availableAmount }
    )
  }
}

export class AllocationAmountExceedsChargeError extends BusinessRuleError {
  constructor(chargeId: string, requestedAmount: number, remainingAmount: number) {
    super(
      'ALLOCATION_EXCEEDS_CHARGE',
      `Allocation amount exceeds remaining charge balance`,
      { chargeId, requestedAmount, remainingAmount }
    )
  }
}

export class ReceiptAlreadyApprovedError extends BusinessRuleError {
  constructor(receiptId: string) {
    super('RECEIPT_ALREADY_APPROVED', `Receipt has already been approved`, { receiptId })
  }
}

// Public Domain Errors
export class EventNotFoundError extends BusinessRuleError {
  constructor(eventId: string) {
    super('EVENT_NOT_FOUND', `Event with ID ${eventId} not found`, { eventId })
  }
}

// Configuration Errors
export class SettingsNotFoundError extends BusinessRuleError {
  constructor() {
    super('SETTINGS_NOT_FOUND', `Academy settings not configured`)
  }
}

// Generic Errors
export class InvalidInputError extends BusinessRuleError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('INVALID_INPUT', message, context)
  }
}

export class UnauthorizedError extends BusinessRuleError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message)
  }
}

export class ForbiddenError extends BusinessRuleError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message)
  }
}

export class ConflictError extends BusinessRuleError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('CONFLICT', message, context)
  }
}
