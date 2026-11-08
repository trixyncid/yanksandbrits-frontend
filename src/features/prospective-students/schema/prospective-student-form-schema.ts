import { z } from 'zod'

const optionalScore = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Number(value)), {
      message: 'Enter a valid score.',
    }),
])

export const prospectiveStudentFormSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name is required.'),
    email: z.union([
      z.literal(''),
      z.string().trim().email('Enter a valid email.'),
    ]),
    phone: z.string().trim().min(8, 'Phone number is required.'),
    gender: z.enum(['male', 'female'], {
      message: 'Select a gender.',
    }),
    course: z.enum(['TOE', 'IEL', 'GET', 'SAT', 'HSK', 'GEN', 'IT', 'NON'], {
      message: 'Select a prediction test.',
    }),
    status: z.enum([
      'consult',
      'prediction_test',
      'cancelled',
      'enrolled',
    ]),
    srNumber: z.string().trim().min(1, 'SR number is required.'),
    date: z.string().trim().min(1, 'Date consulted is required.'),
    resourceId: z.string().min(1, 'Select a resource.'),
    isReferral: z.boolean(),
    referralType: z.enum(['student', 'other']),
    referralStudentId: z.string(),
    referralName: z.string(),
    teleMarketing: z.enum(['WI', 'TM'], {
      message: 'Select telemarketing.',
    }),
    age: z
      .string()
      .trim()
      .min(1, 'Age is required.')
      .refine((value) => {
        const age = Number(value)
        return Number.isInteger(age) && age > 0 && age < 120
      }, 'Enter a valid age.'),
    address: z.string().trim().min(1, 'Address is required.'),
    hasTakenLanguageTest: z.boolean(),
    languageTest: z.union([
      z.literal(''),
      z.enum(['IELTS', 'TOEFL', 'SAT']),
    ]),
    listening: optionalScore,
    speaking: optionalScore,
    reading: optionalScore,
    writing: optionalScore,
    marketingId: z.string().min(1, 'Select an education counsellor.'),
    branchId: z.string().min(1, 'Select a consultation branch.'),
  })
  .superRefine((values, ctx) => {
    if (values.isReferral && values.referralType === 'student' && !values.referralStudentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['referralStudentId'],
        message: 'Select the referring student.',
      })
    }
    if (values.isReferral && values.referralType === 'other' && !values.referralName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['referralName'],
        message: 'Referral name is required.',
      })
    }
    if (values.hasTakenLanguageTest && !values.languageTest) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['languageTest'],
        message: 'Select a language test.',
      })
    }
  })

/** Personal details for another student in the same response. */
export const extraStudentSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required.'),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email.')]),
  phone: z.string().trim().min(8, 'Phone number is required.'),
  gender: z.enum(['male', 'female'], { message: 'Select a gender.' }),
  course: z.enum(['TOE', 'IEL', 'GET', 'SAT', 'HSK', 'GEN', 'IT', 'NON'], {
    message: 'Select a prediction test.',
  }),
  status: z.enum(['consult', 'prediction_test', 'cancelled']),
  srNumber: z.string().trim().min(1, 'SR number is required.'),
  age: z
    .string()
    .trim()
    .min(1, 'Age is required.')
    .refine((value) => {
      const age = Number(value)
      return Number.isInteger(age) && age > 0 && age < 120
    }, 'Enter a valid age.'),
  address: z.string().trim().min(1, 'Address is required.'),
})
