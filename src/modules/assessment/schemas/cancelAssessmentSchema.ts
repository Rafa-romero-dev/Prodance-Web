import { z } from 'zod'

export const cancelAssessmentSchema = z.object({
  assessmentId: z.string().uuid('Invalid assessment ID'),
  reason: z.string().min(1, 'Cancellation reason is required'),
})

export type CancelAssessmentInput = z.infer<typeof cancelAssessmentSchema>
