import { z } from 'zod'

export const rejectReceiptSchema = z.object({
  receiptId: z.string().uuid('Invalid receipt ID'),
  reason: z.string().min(1, 'Rejection reason is required'),
})

export type RejectReceiptInput = z.infer<typeof rejectReceiptSchema>
