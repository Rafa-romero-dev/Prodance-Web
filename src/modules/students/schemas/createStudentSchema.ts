import { z } from 'zod'

export const createStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(20),
  birthDate: z.date().optional(),
  guardianName: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>
