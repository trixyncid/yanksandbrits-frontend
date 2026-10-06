import { z } from 'zod'

import {
  GENERAL_ENGLISH_SPEAKING_LEVELS,
  GENERAL_ENGLISH_SPEAKING_COMMENT_MAX_LENGTH,
  emptyGeneralEnglishSpeaking,
} from '../lib/general-english-speaking'
import {
  GENERAL_ENGLISH_WRITING_LEVELS,
  GENERAL_ENGLISH_WRITING_COMMENT_MAX_LENGTH,
  emptyGeneralEnglishWriting,
} from '../lib/general-english-writing'

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

const generalEnglishSpeakingSchema = z.object({
  notes: z.string().trim(),
  criteria: z.object(
    Object.fromEntries(
      GENERAL_ENGLISH_SPEAKING_LEVELS.flatMap((level) =>
        level.criteria.map((criterion) => [
          criterion.key,
          z.object({
            checked: z.boolean(),
            comment: z
              .string()
              .trim()
              .max(
                GENERAL_ENGLISH_SPEAKING_COMMENT_MAX_LENGTH,
                'Keep this comment to 255 characters.',
              ),
          }),
        ]),
      ),
    ) as Record<
      (typeof GENERAL_ENGLISH_SPEAKING_LEVELS)[number]['criteria'][number]['key'],
      z.ZodObject<{
        checked: z.ZodBoolean
        comment: z.ZodString
      }>
    >,
  ),
})

const generalEnglishWritingSchema = z.object({
  notes: z.string().trim(),
  criteria: z.object(
    Object.fromEntries(
      GENERAL_ENGLISH_WRITING_LEVELS.flatMap((level) =>
        level.criteria.map((criterion) => [
          criterion.key,
          z.object({
            checked: z.boolean(),
            comment: z
              .string()
              .trim()
              .max(
                GENERAL_ENGLISH_WRITING_COMMENT_MAX_LENGTH,
                'Keep this comment to 255 characters.',
              ),
          }),
        ]),
      ),
    ) as Record<
      (typeof GENERAL_ENGLISH_WRITING_LEVELS)[number]['criteria'][number]['key'],
      z.ZodObject<{
        checked: z.ZodBoolean
        comment: z.ZodString
      }>
    >,
  ),
})

const baseFields = {
  studentId: z.string().min(1, 'Select a student.'),
  listening: optionalScore,
  reading: optionalScore,
  writing: optionalScore,
  speaking: optionalScore,
  math: optionalScore,
  writtenTestScore: optionalScore,
  generalEnglishTutorId: optionalTutorId,
  generalEnglishSpeaking: generalEnglishSpeakingSchema.default(
    emptyGeneralEnglishSpeaking,
  ),
  generalEnglishWriting: generalEnglishWritingSchema.default(
    emptyGeneralEnglishWriting,
  ),
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

/** Academic leaders edit a General English assessment — payment omitted. */
export const academicLeaderPredictionTestFormSchema = z.object({
  ...baseFields,
  branchId: z.string(),
  amount: z.string(),
})
