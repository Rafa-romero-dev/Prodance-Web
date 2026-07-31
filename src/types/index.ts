import type { BusinessRuleError } from '@/lib/errors'

// ================================================
// SERVICE RESULT
// ================================================

export interface ServiceResult<T = void> {
  success: boolean
  data?: T
  error?: BusinessRuleError
  warnings?: string[]
  domainEvents?: DomainEvent[]
}

// ================================================
// DOMAIN EVENTS
// ================================================

export type DomainEventType =
  | 'StudentCreated'
  | 'StudentDeactivated'
  | 'StudentReactivated'
  | 'StudentCycleStarted'
  | 'EnrollmentCreated'
  | 'EnrollmentBlocked'
  | 'EnrollmentUnblocked'
  | 'EnrollmentCompleted'
  | 'AttendanceRegistered'
  | 'ConsecutiveAbsenceDetected'
  | 'RecoveryGenerated'
  | 'RecoveryCompleted'
  | 'PromotionCompleted'
  | 'LevelAssessmentCreated'
  | 'LevelAssessmentCompleted'
  | 'ChargeCreated'
  | 'ReceiptUploaded'
  | 'ReceiptApproved'
  | 'ReceiptRejected'
  | 'ReceiptAllocationCreated'
  | 'EventCreated'
  | 'EventPublished'
  | 'SettingsUpdated'

export interface DomainEvent {
  type: DomainEventType
  entityType: string
  entityId: string
  timestamp: Date
  data?: Record<string, unknown>
  userId?: string
}

// ================================================
// PAGINATION
// ================================================

export interface PageParams {
  page?: number
  pageSize?: number
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ================================================
// INPUT DTOS
// ================================================

export interface CreateStudentInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate?: Date
  guardianName?: string
  notes?: string
}

export interface UpdateStudentInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  birthDate?: Date
  guardianName?: string
  notes?: string
}

export interface CreateClassInput {
  name: string
  type: 'REGULAR' | 'COMPLEMENTARY'
  level?: string
  capacity: number
  administratorId: string
  weekday: string
  startTime: string
  endTime: string
}

export interface UpdateClassInput {
  name?: string
  level?: string
  capacity?: number
  administratorId?: string
}

export interface ChangeClassScheduleInput {
  weekday: string
  startTime: string
  endTime: string
  effectiveFrom?: Date
}

export interface CreateEnrollmentInput {
  studentId: string
  classId: string
  studentCycleId: string
  notes?: string
}

export interface CreateAttendanceSessionInput {
  classId: string
  sessionDate: Date
  notes?: string
}

export interface RegisterAttendanceInput {
  sessionId: string
  enrollmentId: string
  status: 'PRESENT' | 'ABSENT'
  isLate?: boolean
  minutesLate?: number
  observation?: string
}

export interface EditAttendanceInput {
  attendanceId: string
  newStatus: 'PRESENT' | 'ABSENT'
  reason: string
}

export interface CompleteRecoveryInput {
  recoveryId: string
  completionNotes?: string
}

export interface UploadReceiptInput {
  studentId: string
  billingMonth: string
  amount: number
  currency?: string
  bank?: string
  referenceNumber?: string
  imageUrl: string
  notes?: string
}

export interface ApproveReceiptInput {
  receiptId: string
  allocations: {
    chargeId: string
    amount: number
    notes?: string
  }[]
}

export interface CreateEventInput {
  title: string
  description?: string
  location?: string
  bannerImage?: string
  visibility: 'PUBLIC' | 'PRIVATE'
  startsAt: Date
  endsAt: Date
}

export interface UpdateEventInput {
  title?: string
  description?: string
  location?: string
  bannerImage?: string
  visibility?: 'PUBLIC' | 'PRIVATE'
  startsAt?: Date
  endsAt?: Date
}

export interface UpdateSettingsInput {
  academyName?: string
  academyLogo?: string
  academyEmail?: string
  academyPhone?: string
  academyAddress?: string
  timezone?: string
  currency?: string
  monthlyBasePrice?: number
  additionalClassPrice?: number
  enrollmentFee?: number
  recoveryFee?: number
  assessmentFee?: number
  maximumClassCapacity?: number
  facebookUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  tiktokUrl?: string
  websiteUrl?: string
}

// ================================================
// OUTPUT DTOS
// ================================================

export interface StudentDTO {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: Date | null
  guardianName: string | null
  profilePhoto: string | null
  enrollmentDate: Date
  status: 'ACTIVE' | 'INACTIVE'
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ClassDTO {
  id: string
  name: string
  type: 'REGULAR' | 'COMPLEMENTARY'
  level: string | null
  capacity: number
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  administratorId: string
  createdAt: Date
  updatedAt: Date
}

export interface EnrollmentDTO {
  id: string
  studentId: string
  classId: string
  studentCycleId: string
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'BLOCKED_RECOVERY' | 'COMPLETED' | 'CANCELLED'
  startDate: Date
  endDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface AttendanceDTO {
  id: string
  attendanceSessionId: string
  enrollmentId: string
  status: 'PRESENT' | 'ABSENT'
  isLate: boolean
  minutesLate?: number
  observation?: string
  registeredAt: Date
  updatedAt: Date
}

export interface RecoveryDTO {
  id: string
  enrollmentId: string
  status: 'PENDING_PAYMENT' | 'READY_TO_SCHEDULE' | 'COMPLETED' | 'CANCELLED'
  generatedAt: Date
  scheduledAt?: Date
  completedAt?: Date
  teacherId: string
  chargeId: string
  completionNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ChargeDTO {
  id: string
  studentId: string
  enrollmentId?: string
  recoveryId?: string
  assessmentId?: string
  type: 'ENROLLMENT' | 'MONTHLY' | 'RECOVERY' | 'LEVEL_ASSESSMENT'
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED'
  description: string
  amount: number
  remainingAmount: number
  dueDate?: Date
  paidAt?: Date
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ReceiptDTO {
  id: string
  studentId: string
  billingMonth: string
  amount: number
  currency: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  bank?: string
  referenceNumber?: string
  imageUrl: string
  notes?: string
  uploadedAt: Date
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface EventDTO {
  id: string
  title: string
  description?: string
  location?: string
  bannerImage?: string
  visibility: 'PUBLIC' | 'PRIVATE'
  status: 'DRAFT' | 'VISIBLE' | 'CANCELLED' | 'ARCHIVED'
  startsAt: Date
  endsAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface AcademySettingsDTO {
  id: string
  academyName: string
  academyLogo?: string
  academyEmail: string
  academyPhone?: string
  academyAddress?: string
  timezone: string
  currency: string
  monthlyBasePrice: number
  additionalClassPrice: number
  enrollmentFee: number
  recoveryFee: number
  assessmentFee: number
  maximumClassCapacity: number
  facebookUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  tiktokUrl?: string
  websiteUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuditLogDTO {
  id: string
  administratorId: string
  entityType: string
  entityId: string
  action: string
  previousState: string | null
  newState: string | null
  metadata: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}
