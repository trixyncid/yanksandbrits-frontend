import { z } from 'zod'

export const scheduleFormSchema = z
  .object({
    programId: z.string().trim().min(1, 'Program is required.'),
    classroomId: z.string().trim().min(1, 'Classroom is required.'),
    tutorId: z.string().trim(),
    participantType: z.enum(['student', 'group']),
    studentId: z.string().trim(),
    studentGroupId: z.string().trim(),
    description: z.string().trim(),
    date: z.string().trim().min(1, 'Date is required.'),
    startTime: z
      .string()
      .trim()
      .regex(/^\d{2}:\d{2}$/, 'Start time is required.'),
    endTime: z
      .string()
      .trim()
      .regex(/^\d{2}:\d{2}$/, 'End time is required.'),
    status: z.enum(['1_ON', '2_FN', '3_CN']),
  })
  .superRefine((values, ctx) => {
    if (values.participantType === 'student' && !values.studentId) {
      ctx.addIssue({
        code: 'custom',
        path: ['studentId'],
        message: 'Select a student.',
      })
    }

    if (values.participantType === 'group' && !values.studentGroupId) {
      ctx.addIssue({
        code: 'custom',
        path: ['studentGroupId'],
        message: 'Select a student group.',
      })
    }

    if (values.startTime && values.endTime && values.endTime <= values.startTime) {
      ctx.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'End time must be after start time.',
      })
    }
  })
