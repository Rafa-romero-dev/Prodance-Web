// Level Assessment Module Types

export type AssessmentDTO = {
  id: string
  studentId: string
  studentCycleId: string
  recommendedClassId: string | null
  status: 'PENDING_PAYMENT' | 'READY' | 'COMPLETED' | 'CANCELLED'
  teacherId: string
  chargeId: string
  performedAt: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export type CreateAssessmentInput = {
  studentId: string
  studentCycleId: string
  classId: string
  teacherId: string
}

export type CompleteAssessmentInput = {
  assessmentId: string
  targetClassId: string
  notes?: string
  administratorId: string
}

export type CancelAssessmentInput = {
  assessmentId: string
  reason: string
  administratorId: string
}

export type MarkReadyInput = {
  assessmentId: string
  administratorId: string
}

export type AssessmentValidationResult = {
  valid: boolean
  errors: string[]
  isRegularClass?: boolean
  isMandatory?: boolean
}
