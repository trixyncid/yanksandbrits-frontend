import { z } from 'zod'

import {
  PREDICTION_PROGRAM_CODES,
  isToeflCourse,
  programOptionsForCourse,
} from '../../../shared/api/choices'

function normalizeScore(value: string) {
  return value.trim().replace(',', '.')
}

const optionalScore = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Number(normalizeScore(value))), {
      message: 'Enter a valid score.',
    })
    .refine((value) => {
      const fraction = normalizeScore(value).split('.')[1]
      return !fraction || fraction.length <= 2
    }, 'Use at most 2 decimal places.'),
])

const optionalTutorId = z.string()

const optionalSessionCount = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), {
      message: 'Enter a whole number.',
    })
    .refine((value) => Number(value) >= 0, {
      message: 'Sessions must be 0 or greater.',
    }),
])

const optionalPredictionProgram = z.union([
  z.literal(''),
  z.enum(PREDICTION_PROGRAM_CODES),
])

const baseFields = {
  studentId: z.string().min(1, 'Select a student.'),
  ieltsProgram: optionalPredictionProgram,
  managerApproved: z.boolean().default(false),
  academicLeaderDecision: z.union([
    z.literal(''),
    z.enum(['approve', 'reject']),
  ]),
  academicLeaderRemarks: z.string().trim(),
  listening: optionalScore,
  reading: optionalScore,
  writing: optionalScore,
  speaking: optionalScore,
  math: optionalScore,
  listeningTutorId: optionalTutorId,
  readingTutorId: optionalTutorId,
  writingTutorId: optionalTutorId,
  speakingTutorId: optionalTutorId,
  mathTutorId: optionalTutorId,
  listeningSessions: optionalSessionCount,
  readingSessions: optionalSessionCount,
  writingSessions: optionalSessionCount,
  speakingSessions: optionalSessionCount,
  mathSessions: optionalSessionCount,
  scheduleMorning: z.boolean(),
  scheduleAfternoon: z.boolean(),
  scheduleEvening: z.boolean(),
  scheduleNote: z.string().trim(),
  description: z.string().trim(),
  status: z.enum(['pending', 'approved', 'void']),
  paymentProofFiles: z.array(z.instanceof(File)),
}

const paymentFields = {
  branchId: z.string().min(1, 'Select a branch.'),
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required.')
    .refine((value) => Number(value.replace(/[^\d]/g, '')) >= 0, {
      message: 'Amount must be 0 or greater.',
    }),
}

/** Full schema for roles that manage payment. */
export const predictionTestFormSchema = z.object({
  ...baseFields,
  ...paymentFields,
})

const SCORE_LABELS = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
  math: 'Math',
} as const

type ProgramScoreKey = keyof typeof SCORE_LABELS

/** Scores that must be filled before a program can be selected. */
export function programScoreKeysForCourse(
  course: string | null | undefined,
): ProgramScoreKey[] {
  if (programOptionsForCourse(course).length === 0) {
    return []
  }
  if (isToeflCourse(course)) {
    return ['listening', 'reading', 'writing']
  }
  return ['listening', 'reading', 'writing', 'speaking']
}

function requireScoresBeforeProgram(
  values: z.infer<typeof predictionTestFormSchema>,
  ctx: z.RefinementCtx,
  course: string | null | undefined,
) {
  const keys = programScoreKeysForCourse(course)
  if (keys.length === 0 || !values.ieltsProgram) {
    return keys.every((key) => values[key].trim() !== '')
  }

  let complete = true
  for (const key of keys) {
    if (values[key].trim()) {
      continue
    }
    complete = false
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [key],
      message: `Enter the ${SCORE_LABELS[key].toLowerCase()} score before selecting a program.`,
    })
  }
  return complete
}

/** Managers and other payment editors. A program can be saved only after its scores. */
export function predictionTestFormSchemaFor(course: string | null | undefined) {
  return predictionTestFormSchema.superRefine((values, ctx) => {
    requireScoresBeforeProgram(values, ctx, course)
  })
}

/**
 * Education counsellors own scores, the assigned program, and payment.
 * Scores stay blank until the student finishes the test. A program is
 * required only after those scores are entered.
 */
export function educationCounsellorPredictionTestFormSchema(
  course: string | null | undefined,
) {
  return predictionTestFormSchema.superRefine((values, ctx) => {
    const keys = programScoreKeysForCourse(course)
    const scoresComplete = requireScoresBeforeProgram(values, ctx, course)
    if (keys.length > 0 && scoresComplete && !values.ieltsProgram) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ieltsProgram'],
        message: 'Select a program.',
      })
    }
  })
}

/** Academic leaders review programs and assign tutors — payment omitted. */
export const academicLeaderPredictionTestFormSchema = z
  .object({
    ...baseFields,
    branchId: z.string(),
    amount: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.academicLeaderDecision !== 'reject') {
      return
    }
    if (!values.academicLeaderRemarks.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['academicLeaderRemarks'],
          message: 'Add the reasons for requesting changes.',
      })
    }
  })
