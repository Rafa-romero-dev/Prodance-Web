import { z } from 'zod'

export const approveReceiptSchema = z.object({
  receiptId: z.string().uuid('Invalid receipt ID'),
})

export type ApproveReceiptInput = z.infer<typeof approveReceiptSchema>
