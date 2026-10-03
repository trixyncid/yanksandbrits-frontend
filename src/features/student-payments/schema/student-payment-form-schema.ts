import { z } from 'zod'

import { installmentExceedsRemaining } from '../lib/payment-display'

const amountSchema = z
  .string()
  .trim()
  .min(1, 'Amount is required.')
  .refine((value) => Number(value.replace(/[^\d]/g, '')) > 0, {
    message: 'Amount must be greater than 0.',
  })

export const studentPaymentTermFormSchema = z.object({
  key: z.string(),
  id: z.string().optional(),
  amount: amountSchema,
  status: z.enum(['pending', 'approved', 'void']),
  description: z.string(),
  paymentDate: z
    .string()
    .trim()
    .min(1, 'Payment date is required.')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid payment date.'),
  branchId: z.string().min(1, 'Select a branch.'),
})

export const studentPaymentFormSchema = z
  .object({
    studentId: z.string(),
    prospectiveStudentId: z.string(),
    title: z.string().trim().min(2, 'Title is required.'),
    fullAmount: amountSchema,
    terms: z
      .array(studentPaymentTermFormSchema)
      .min(1, 'Add at least one installment.'),
  })
  .superRefine((values, ctx) => {
    const hasStudent = Boolean(values.studentId)
    const hasProspect = Boolean(values.prospectiveStudentId)
    if (hasStudent === hasProspect) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: hasStudent ? ['prospectiveStudentId'] : ['studentId'],
        message: hasStudent
          ? 'Clear the prospective student or the student — pick only one.'
          : 'Select a student or a prospective student.',
      })
    }

    values.terms.forEach((term, index) => {
      if (
        installmentExceedsRemaining({
          plannedAmount: values.fullAmount,
          terms: values.terms,
          editingKey: term.key,
          editingId: term.id,
          nextStatus: term.status,
          nextAmount: term.amount,
        })
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['terms', index, 'amount'],
          message:
            'Amount cannot be greater than the remaining plan balance.',
        })
      }
    })
  })
