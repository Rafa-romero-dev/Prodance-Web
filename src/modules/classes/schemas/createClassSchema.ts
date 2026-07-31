import { z } from 'zod'

export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(100),
  type: z.enum(['REGULAR', 'COMPLEMENTARY']),
  level: z.string().max(50).optional(),
  capacity: z.number().int().min(1).max(100),
  administratorId: z.string().uuid('Invalid administrator ID'),
  weekday: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
})

export type CreateClassInput = z.infer<typeof createClassSchema>

export const updateClassSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  level: z.string().max(50).optional(),
  capacity: z.number().int().min(1).max(100).optional(),
  administratorId: z.string().uuid().optional(),
})

export type UpdateClassInput = z.infer<typeof updateClassSchema>
