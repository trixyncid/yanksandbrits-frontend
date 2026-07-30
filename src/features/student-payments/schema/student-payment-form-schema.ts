import { z } from 'zod'

export const studentPaymentFormSchema = z.object({
  studentId: z.string().min(1, 'Select a student.'),
  title: z.string().trim().min(2, 'Title is required.'),
  description: z.string().trim(),
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required.')
    .refine((value) => Number(value.replace(/[^\d]/g, '')) > 0, {
      message: 'Amount must be greater than 0.',
    }),
  status: z.enum(['pending', 'approved', 'void']),
  hasPaymentProof: z.boolean(),
})
