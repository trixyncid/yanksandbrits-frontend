import { z } from 'zod'

const amount = z
  .string()
  .trim()
  .refine((value) => /^\d+$/.test(value), 'Enter a whole amount in rupiah.')

export const marketingCommissionTierFormSchema = z
  .object({
    minAmount: amount,
    // Empty means the tier is open-ended upwards.
    maxAmount: z.union([amount, z.literal('')]),
    percentage: z
      .string()
      .trim()
      .refine((value) => value !== '', 'Commission percentage is required.')
      .refine(
        (value) => Number.isFinite(Number(value)),
        'Enter a valid percentage.',
      )
      .refine(
        (value) => Number(value) >= 0 && Number(value) <= 100,
        'Percentage must be between 0 and 100.',
      ),
  })
  .refine(
    (values) =>
      values.maxAmount === '' ||
      Number(values.maxAmount) >= Number(values.minAmount),
    {
      path: ['maxAmount'],
      message: 'Max amount must be greater than or equal to min amount.',
    },
  )

export type MarketingCommissionTierFormSchema = z.infer<
  typeof marketingCommissionTierFormSchema
>
