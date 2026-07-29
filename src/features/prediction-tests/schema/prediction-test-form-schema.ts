import { z } from 'zod'

export const predictionTestFormSchema = z.object({
  studentId: z.string().min(1, 'Select a student.'),
  score: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || !Number.isNaN(Number(value)),
      'Enter a valid score.',
    ),
  description: z.string().trim(),
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required.')
    .refine((value) => Number(value.replace(/[^\d]/g, '')) >= 0, {
      message: 'Amount must be 0 or greater.',
    }),
  status: z.enum(['pending', 'approved', 'void']),
  hasPaymentProof: z.boolean(),
})
