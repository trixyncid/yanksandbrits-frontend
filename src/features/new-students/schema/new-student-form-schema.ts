import { z } from 'zod'

export const newStudentFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required.'),
  email: z.union([
    z.literal(''),
    z.string().trim().email('Enter a valid email.'),
  ]),
  phone: z.string().trim().min(8, 'Phone number is required.'),
  gender: z.enum(['male', 'female'], {
    message: 'Select a gender.',
  }),
  course: z.string().min(1, 'Select a course.'),
  status: z.enum([
    'waiting',
    'follow_up',
    'consult',
    'prediction_test',
    'cancelled',
  ]),
  educationCounsellor: z.string().min(1, 'Select an education counsellor.'),
  branch: z.string().min(1, 'Select a branch.'),
})
