import { z } from 'zod'

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9A-Fa-f]{6})$/, 'Enter a valid hex color (e.g. #4274B9).')

export const programFormSchema = z.object({
  code: z.string().trim().min(1, 'Program code is required.'),
  title: z.string().trim().min(2, 'Program title is required.'),
  description: z.string().trim(),
  isActive: z.boolean(),
  backgroundColor: hexColor,
  textColor: hexColor,
})
