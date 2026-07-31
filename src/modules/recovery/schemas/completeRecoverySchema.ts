import { z } from 'zod'

export const completeRecoverySchema = z.object({
  recoveryId: z.string().uuid('Invalid recovery ID'),
  completedAt: z.date(),
  completionNotes: z.string().optional(),
})

export type CompleteRecoveryInput = z.infer<typeof completeRecoverySchema>
