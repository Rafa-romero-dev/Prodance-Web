import { z } from 'zod'

export const cancelRecoverySchema = z.object({
  recoveryId: z.string().uuid('Invalid recovery ID'),
  reason: z.string().min(1, 'Cancellation reason is required'),
})

export type CancelRecoveryInput = z.infer<typeof cancelRecoverySchema>
