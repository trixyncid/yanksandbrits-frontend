import { z } from 'zod'

export const userFormSchema = z.object({
  pin: z
    .string()
    .trim()
    .min(1, 'PIN is required.')
    .max(4, 'PIN must be 1–4 digits.')
    .regex(/^\d{1,4}$/, 'PIN must be 1–4 digits.'),
  email: z.email('Enter a valid email address.'),
  fullName: z.string().trim().min(2, 'Full name is required.'),
  password: z.string(),
  initial: z
    .string()
    .trim()
    .max(2, 'Initial must be at most 2 characters.'),
  gender: z.enum(['male', 'female']),
  birthPlace: z.string().trim().max(20, 'Birth place is too long.'),
  birthDate: z.string(),
  address: z.string().trim(),
  mobilePhone: z.string().trim(),
  homePhone: z.string().trim(),
  otherPhone: z.string().trim(),
  isActive: z.boolean(),
  isTutor: z.boolean(),
  isMarketing: z.boolean(),
  isManager: z.boolean(),
  staffType: z
    .string()
    .trim()
    .min(1, 'Staff type is required.')
    .refine(
      (value) => value === 'English' || value === 'Mandarin',
      'Select a valid staff type.',
    ),
  branchId: z.string().trim().min(1, 'Branch is required.'),
  paidLeave: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Paid leave must be a number.'),
  resignDate: z.string(),
})

export function validateUserPassword(
  password: string,
  mode: 'create' | 'edit',
) {
  if (mode === 'create' && !password.trim()) {
    return 'Password is required.'
  }

  if (password.trim() && password.trim().length < 6) {
    return 'Password must be at least 6 characters.'
  }

  return undefined
}
