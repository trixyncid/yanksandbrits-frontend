import { z } from 'zod'

export const loginFormSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must contain at least 8 characters.'),
  rememberMe: z.boolean(),
})
