import { z } from 'zod'

export const classroomFormSchema = z.object({
  code: z.string().trim().min(1, 'Classroom code is required.'),
  className: z.string().trim().min(2, 'Class name is required.'),
  isActive: z.boolean(),
  branchId: z.string().min(1, 'Select a branch.'),
})
