import { z } from 'zod'

export const completeAssessmentSchema = z.object({
  assessmentId: z.string().uuid('Invalid assessment ID'),
  targetClassId: z.string().uuid('Invalid target class ID'),
  notes: z.string().optional(),
})

export type CompleteAssessmentInput = z.infer<typeof completeAssessmentSchema>
