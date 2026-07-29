import { z } from 'zod'

export const studentResponseFormSchema = z.object({
  studentPin: z.string().min(1, 'Select a student.'),
  tutorPin: z.string().min(1, 'Select a tutor.'),
  title: z.string().trim().min(2, 'Title is required.'),
  description: z.string().trim(),
  status: z.enum(['pending', 'approved', 'void']),
})
