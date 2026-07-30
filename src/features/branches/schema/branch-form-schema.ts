import { z } from 'zod'

export const branchFormSchema = z.object({
  name: z.string().trim().min(2, 'Branch name is required.'),
  phone: z.string().trim(),
  address: z.string().trim(),
  brandId: z.string(),
})
