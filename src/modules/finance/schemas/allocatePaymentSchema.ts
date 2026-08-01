import { z } from 'zod'

export const allocatePaymentSchema = z.object({
  receiptId: z.string().uuid('Invalid receipt ID'),
  chargeId: z.string().uuid('Invalid charge ID'),
  amount: z.number().int().positive('Amount must be positive'),
  notes: z.string().optional(),
})

export type AllocatePaymentInput = z.infer<typeof allocatePaymentSchema>
