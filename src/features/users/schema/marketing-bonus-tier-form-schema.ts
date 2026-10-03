import { z } from 'zod'

const amount = z
  .string()
  .trim()
  .refine((value) => /^\d+$/.test(value), 'Enter a whole amount in rupiah.')

export const marketingBonusTierFormSchema = z
  .object({
    minAmount: amount,
    // Empty means the tier is open-ended upwards.
    maxAmount: z.union([amount, z.literal('')]),
    bonusAmount: amount,
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

export type MarketingBonusTierFormSchema = z.infer<
  typeof marketingBonusTierFormSchema
>
