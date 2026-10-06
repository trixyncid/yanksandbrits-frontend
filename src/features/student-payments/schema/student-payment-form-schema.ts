import { z } from 'zod'

import {
  installmentAmountCap,
  planAmountDue,
} from '../lib/payment-display'
import { parseCurrencyValue } from '../../../shared/lib/currency'

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

const discountSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || Number(value.replace(/[^\d]/g, '')) >= 0, {
    message: 'Enter a valid discount.',
  })

export function createStudentPaymentFormSchema(
  pretestCredit = 0,
  maxTerms = 2,
  requireInstallmentAmounts = true,
  allowEnrolledProspect = false,
) {
  const termSchema = requireInstallmentAmounts
    ? studentPaymentTermFormSchema
    : studentPaymentTermFormSchema.extend({
        amount: z.string(),
      })

  return z
    .object({
      studentId: z.string(),
      prospectiveStudentId: z.string(),
      title: z.string().trim().min(2, 'Title is required.'),
      fullAmount: amountSchema,
      discountAmount: discountSchema,
      installmentPlan: z.enum(['full', 'two', '']),
      terms: z.array(termSchema),
    })
    .superRefine((values, ctx) => {
      const hasStudent = Boolean(values.studentId)
      const hasProspect = Boolean(values.prospectiveStudentId)
      const retainedProspect = allowEnrolledProspect && hasStudent && hasProspect
      if (!retainedProspect && hasStudent === hasProspect) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: hasStudent ? ['prospectiveStudentId'] : ['studentId'],
          message: hasStudent
            ? 'Clear the prospective student or the student — pick only one.'
            : 'Select a student or a prospective student.',
        })
      }

      const courseFee = parseCurrencyValue(values.fullAmount)
      const discount = parseCurrencyValue(values.discountAmount)
      if (discount > courseFee) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountAmount'],
          message: 'Discount cannot be more than the course fee.',
        })
      }

      const due = planAmountDue(courseFee, discount, pretestCredit)
      if (due > 0 && values.terms.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['terms'],
          message: 'Add at least one installment.',
        })
      }
      if (values.terms.length > maxTerms) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['terms'],
          message: 'Choose pay in full or 2 payments only.',
        })
      }

      values.terms.forEach((term, index) => {
        const cap = installmentAmountCap({
          plannedAmount: due,
          zeroIsCapped: courseFee > 0,
          terms: values.terms,
          editingKey: term.key,
          editingId: term.id,
          nextStatus: term.status,
        })
        const amount = parseCurrencyValue(term.amount)
        if (cap == null || amount <= cap) return
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['terms', index, 'amount'],
          message:
            cap === 0
              ? 'No balance is left. Lower an earlier installment that already covers the amount due.'
              : 'Amount cannot be greater than the remaining balance.',
        })
      })
    })
}

export const studentPaymentFormSchema = createStudentPaymentFormSchema()
