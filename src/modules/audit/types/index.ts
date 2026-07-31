import type { DomainEventType } from '@/types'

export type AuditAction =
  | 'StudentCreated'
  | 'StudentUpdated'
  | 'StudentDeactivated'
  | 'StudentReactivated'
  | 'ClassCreated'
  | 'ClassUpdated'
  | 'ClassScheduleChanged'
  | 'EnrollmentCreated'
  | 'EnrollmentBlocked'
  | 'EnrollmentUnblocked'
  | 'EnrollmentCompleted'
  | 'EnrollmentCancelled'
  | 'AttendanceSessionCreated'
  | 'AttendanceRegistered'
  | 'AttendanceEdited'
  | 'RecoveryGenerated'
  | 'RecoveryCompleted'
  | 'RecoveryStarted'
  | 'RecoveryCancelled'
  | 'PromotionCreated'
  | 'LevelAssessmentCreated'
  | 'LevelAssessmentCompleted'
  | 'LevelAssessmentCancelled'
  | 'ChargeCreated'
  | 'ChargeCancelled'
  | 'ReceiptUploaded'
  | 'ReceiptApproved'
  | 'ReceiptRejected'
  | 'ReceiptAllocationCreated'
  | 'ReceiptAllocationReversed'
  | 'EventCreated'
  | 'EventUpdated'
  | 'EventPublished'
  | 'EventCancelled'
  | 'SettingsUpdated'

export interface CreateAuditLogInput {
  administratorId: string
  entityType: string
  entityId: string
  action: AuditAction
  previousState?: string
  newState?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export interface AuditLogFilters {
  administratorId?: string
  entityType?: string
  entityId?: string
  action?: AuditAction
  startDate?: Date
  endDate?: Date
}
