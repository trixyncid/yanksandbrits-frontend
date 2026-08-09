import { z } from 'zod'

export const staffPermissionFormSchema = z.object({
  name: z.string().trim().min(1, 'Group name is required.'),
  code: z
    .string()
    .trim()
    .max(64, 'Code is too long.')
    .refine(
      (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      'Use lowercase letters, numbers, and hyphens only.',
    ),
  description: z.string(),
  permissionIds: z.array(z.string()),
})
