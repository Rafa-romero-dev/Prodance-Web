import { z } from 'zod'

export const registerAttendanceSchema = z.object({
  attendanceSessionId: z.string().uuid('Invalid session ID'),
  enrollmentId: z.string().uuid('Invalid enrollment ID'),
  status: z.enum(['PRESENT', 'ABSENT']),
  isLate: z.boolean().default(false),
  minutesLate: z.number().int().positive().nullable().default(null),
  observation: z.string().nullable().default(null),
})

export type RegisterAttendanceInput = z.infer<typeof registerAttendanceSchema>
