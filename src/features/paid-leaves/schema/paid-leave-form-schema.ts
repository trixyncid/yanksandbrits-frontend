import { z } from 'zod'

export const paidLeaveFormSchema = z
  .object({
    userId: z.string().min(1, 'Select a staff member.'),
    startDate: z.string().min(1, 'Start date is required.'),
    endDate: z.string().min(1, 'End date is required.'),
    notes: z.string(),
    status: z.enum(['pending', 'approved', 'void']),
    filesFile: z.instanceof(File).nullable(),
  })
  .refine(
    (values) => {
      if (!values.startDate || !values.endDate) {
        return true
      }
      return values.endDate >= values.startDate
    },
    {
      message: 'End date must be on or after the start date.',
      path: ['endDate'],
    },
  )
