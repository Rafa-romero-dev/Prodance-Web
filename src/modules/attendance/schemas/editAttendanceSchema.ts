import { z } from 'zod'

export const editAttendanceSchema = z.object({
  attendanceId: z.string().uuid('Invalid attendance ID'),
  status: z.enum(['PRESENT', 'ABSENT']),
  isLate: z.boolean().default(false),
  minutesLate: z.number().int().positive().nullable().default(null),
  observation: z.string().nullable().default(null),
  reason: z.string().optional().describe('Reason for editing attendance'),
})

export type EditAttendanceInput = z.infer<typeof editAttendanceSchema>
