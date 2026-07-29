import { z } from 'zod'

export const studentGroupFormSchema = z.object({
  groupName: z.string().trim().min(2, 'Group name is required.'),
  memberPins: z
    .array(z.string())
    .min(1, 'Select at least one student participant.'),
  status: z.enum(['active', 'inactive']),
})
