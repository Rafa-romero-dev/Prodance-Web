// Finance Module Types

// ================================================
// CHARGE TYPES
// ================================================

export type ChargeDTO = {
  id: string
  studentId: string
  enrollmentId: string | null
  recoveryId: string | null
  assessmentId: string | null
  type: 'ENROLLMENT' | 'MONTHLY' | 'RECOVERY' | 'LEVEL_ASSESSMENT'
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED'
  description: string
  amount: number
  remainingAmount: number
  dueDate: Date | null
  paidAt: Date | null
  cancelledAt: Date | null
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export type CreateChargeInput = {
  studentId: string
  type: 'ENROLLMENT' | 'MONTHLY' | 'RECOVERY' | 'LEVEL_ASSESSMENT'
  description: string
  amount: number
  enrollmentId?: string
  recoveryId?: string
  assessmentId?: string
  dueDate?: Date
}

export type CancelChargeInput = {
  chargeId: string
  reason: string
  administratorId: string
}

// ================================================
// RECEIPT TYPES
// ================================================

export type ReceiptDTO = {
  id: string
  studentId: string
  billingMonth: string
  amount: number
  currency: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  bank: string | null
  referenceNumber: string | null
  imageUrl: string
  notes: string | null
  uploadedAt: Date
  reviewedAt: Date | null
  reviewedById: string | null
  createdAt: Date
  updatedAt: Date
}

export type UploadReceiptInput = {
  studentId: string
  billingMonth: string
  amount: number
  imageUrl: string
  bank?: string
  referenceNumber?: string
  currency?: string
  notes?: string
}

export type ApproveReceiptInput = {
  receiptId: string
  administratorId: string
}

export type RejectReceiptInput = {
  receiptId: string
  reason: string
  administratorId: string
}

// ================================================
// ALLOCATION TYPES
// ================================================

export type ReceiptAllocationDTO = {
  id: string
  receiptId: string
  chargeId: string
  allocatedAmount: number
  allocatedById: string
  notes: string | null
  createdAt: Date
}

export type AllocatePaymentInput = {
  receiptId: string
  chargeId: string
  amount: number
  administratorId: string
  notes?: string
}

// ================================================
// BILLING TYPES
// ================================================

export type MonthlyBillingInput = {
  month: Date
}

export type BillingResult = {
  chargesGenerated: number
  studentsProcessed: number
  errors: Array<{
    studentId: string
    error: string
  }>
}

export type PricingConfig = {
  basePrice: number // First class
  additionalPrice: number // Each additional class
  recoveryFee: number
  assessmentFee: number
  enrollmentFee: number
}
