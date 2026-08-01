import { z } from 'zod'

export const uploadReceiptSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  billingMonth: z.string().regex(/^\w+ \d{4}$/, 'Invalid billing month format'),
  amount: z.number().int().positive('Amount must be positive'),
  imageUrl: z.string().url('Invalid image URL'),
  bank: z.string().optional(),
  referenceNumber: z.string().optional(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
})

export type UploadReceiptInput = z.infer<typeof uploadReceiptSchema>
