import { z } from 'zod'

export const createAssessmentSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  studentCycleId: z.string().uuid('Invalid student cycle ID'),
  classId: z.string().uuid('Invalid class ID'),
  teacherId: z.string().uuid('Invalid teacher ID'),
})

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>
