import { z } from 'zod'

export const studentFormSchema = z.object({
  pin: z
    .string()
    .trim()
    .min(1, 'Student PIN is required.')
    .max(16, 'PIN is too long.'),
  fullName: z.string().trim().min(2, 'Full name is required.'),
  email: z.union([
    z.literal(''),
    z.email('Enter a valid email address.'),
  ]),
  gender: z.enum(['M', 'F']),
  birthPlace: z.string().trim(),
  birthDate: z.string(),
  address: z.string().trim(),
  mobilePhone: z.string().trim().min(6, 'Mobile phone is required.'),
  homePhone: z.string().trim(),
  othersPhone: z.string().trim(),
  occupation: z.string().trim().min(1, 'Occupation is required.'),
  institution: z.string().trim(),
  enrollmentDate: z.string().min(1, 'Enrollment date is required.'),
  counsellor: z.string().trim().min(1, 'Education counsellor is required.'),
  referral: z.string().trim(),
  grn: z.string().trim(),
  branch: z.string().trim().min(1, 'Branch is required.'),
  status: z.enum(['active', 'inactive']),
})
