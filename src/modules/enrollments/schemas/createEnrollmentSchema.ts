import { z } from 'zod'

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  classId: z.string().uuid('Invalid class ID'),
  studentCycleId: z.string().uuid('Invalid student cycle ID'),
  notes: z.string().max(500).optional(),
})

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>
