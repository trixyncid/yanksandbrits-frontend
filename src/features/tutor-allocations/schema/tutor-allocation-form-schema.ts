import { z } from 'zod'

import { TUTOR_ALLOCATION_PROGRAM_CODES } from '../lib/programs'
import type {
  TutorAllocationClassType,
  TutorAllocationGroupSize,
} from '../types/tutor-allocation'

export function seatCount(values: {
  classType: TutorAllocationClassType
  groupSize: TutorAllocationGroupSize
}) {
  return values.classType === 'private' ? 1 : Number(values.groupSize)
}

const sessionCount = z
  .string()
  .refine((value) => value.trim() === '' || /^\d+$/.test(value.trim()), {
    message: 'Enter a whole number of sessions.',
  })

export const tutorAllocationFormSchema = z
  .object({
    classType: z.enum(['private', 'group']),
    groupSize: z.enum(['2', '3']),
    program: z.enum(TUTOR_ALLOCATION_PROGRAM_CODES, {
      message: 'Select a program.',
    }),
    studentIds: z.tuple([z.string(), z.string(), z.string()]),
    sessionsPerWeek: z.enum(['', '1', '2', '3', '4_6']),
    availability: z.object({
      monday: z.array(z.string()),
      tuesday: z.array(z.string()),
      wednesday: z.array(z.string()),
      thursday: z.array(z.string()),
      friday: z.array(z.string()),
      saturday: z.array(z.string()),
    }),
    scheduleNote: z.string(),
    listeningTutorId: z.string(),
    readingTutorId: z.string(),
    writingTutorId: z.string(),
    speakingTutorId: z.string(),
    mathTutorId: z.string(),
    listeningSessions: sessionCount,
    readingSessions: sessionCount,
    writingSessions: sessionCount,
    speakingSessions: sessionCount,
    mathSessions: sessionCount,
    generalEnglishUnit1: z.string(),
    generalEnglishUnit1Sessions: sessionCount,
    generalEnglishUnit1TutorId: z.string(),
    generalEnglishUnit2: z.string(),
    generalEnglishUnit2Sessions: sessionCount,
    generalEnglishUnit2TutorId: z.string(),
    generalEnglishGrammarSessions: sessionCount,
    generalEnglishGrammarTutorId: z.string(),
  })
  .superRefine((values, context) => {
    const count = seatCount(values)
    const chosen = values.studentIds.slice(0, count)
    if (chosen.some((studentId) => studentId.trim() === '')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['studentIds'],
        message: 'Select a student for every seat.',
      })
      return
    }
    if (new Set(chosen).size !== chosen.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['studentIds'],
        message: 'Each student can only be added once.',
      })
    }
  })
