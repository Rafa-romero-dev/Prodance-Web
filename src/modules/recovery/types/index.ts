// Recovery Module Types

export type RecoveryDTO = {
  id: string
  enrollmentId: string
  status: 'PENDING_PAYMENT' | 'READY_TO_SCHEDULE' | 'COMPLETED' | 'CANCELLED'
  generatedAt: Date
  scheduledAt: Date | null
  completedAt: Date | null
  teacherId: string
  chargeId: string
  completionNotes: string | null
  createdAt: Date
  updatedAt: Date
}

export type GenerateRecoveryInput = {
  enrollmentId: string
  teacherId: string
  administratorId: string
}

export type CompleteRecoveryInput = {
  recoveryId: string
  completedAt: Date
  completionNotes?: string
  administratorId: string
}

export type CancelRecoveryInput = {
  recoveryId: string
  reason: string
  administratorId: string
}

export type RecoveryGenerationResult = {
  recovery: RecoveryDTO
  chargeCreated: boolean
  enrollmentBlocked: boolean
  events: any[]
}
