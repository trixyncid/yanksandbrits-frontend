import { z } from 'zod'

export const bookkeepingFormSchema = z
  .object({
    startDate: z.string().trim().min(1, 'Start date is required.'),
    endDate: z.string().trim().min(1, 'End date is required.'),
    title: z.string().trim(),
    status: z.enum(['pending', 'approved', 'void'], {
      message: 'Select a status.',
    }),
    branchId: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.startDate && values.endDate && values.startDate > values.endDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date must be on or after the start date.',
      })
    }
  })
