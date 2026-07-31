import { z } from 'zod'

export const createSessionSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  scheduleVersionId: z.string().uuid('Invalid schedule version ID'),
  sessionDate: z.date(),
  notes: z.string().nullable().default(null),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
