export type ApprovalStatusCode = '1_PD' | '2_AP' | '3_VD'
export type ApprovalStatusUi = 'pending' | 'approved' | 'void'

export type PaymentPlanStatusCode = '1_IN' | '2_CP'
export type PaymentPlanStatusUi = 'incomplete' | 'complete'

export type ProgramStatusCode = '1_OP' | '2_CL'
export type ProgramStatusUi = 'ongoing' | 'completed'

export type ResponseStatusCode =
  | '3_CO'
  | '4_PT'
  | '5_CA'
  | '6_EN'

export type ResponseStatusUi =
  | 'consult'
  | 'prediction_test'
  | 'cancelled'
  | 'enrolled'

export type CourseCode = 'TOE' | 'IEL' | 'GET' | 'SAT' | 'HSK' | 'GEN'
export type LanguageTestCode = 'IELTS' | 'TOEFL' | 'SAT'
export type ProspectResource =
  | 'Instagram'
  | 'Referral'
  | 'Walk-in'
  | 'Facebook'
  | 'Website'
  | 'Google'
  | 'TikTok'
  | 'Other'

export type TeleMarketingCode = 'WI' | 'TM'
export type GenderCode = 'M' | 'F'
export type GenderUi = 'male' | 'female'

const approvalFromApi: Record<ApprovalStatusCode, ApprovalStatusUi> = {
  '1_PD': 'pending',
  '2_AP': 'approved',
  '3_VD': 'void',
}

const approvalToApi: Record<ApprovalStatusUi, ApprovalStatusCode> = {
  pending: '1_PD',
  approved: '2_AP',
  void: '3_VD',
}

const paymentPlanFromApi: Record<PaymentPlanStatusCode, PaymentPlanStatusUi> = {
  '1_IN': 'incomplete',
  '2_CP': 'complete',
}

const programFromApi: Record<ProgramStatusCode, ProgramStatusUi> = {
  '1_OP': 'ongoing',
  '2_CL': 'completed',
}

const programToApi: Record<ProgramStatusUi, ProgramStatusCode> = {
  ongoing: '1_OP',
  completed: '2_CL',
}

const responseFromApi: Record<ResponseStatusCode, ResponseStatusUi> = {
  '3_CO': 'consult',
  '4_PT': 'prediction_test',
  '5_CA': 'cancelled',
  '6_EN': 'enrolled',
}

const responseToApi: Record<ResponseStatusUi, ResponseStatusCode> = {
  consult: '3_CO',
  prediction_test: '4_PT',
  cancelled: '5_CA',
  enrolled: '6_EN',
}

export function mapApprovalStatusFromApi(
  code: string | null | undefined,
): ApprovalStatusUi {
  if (code && code in approvalFromApi) {
    return approvalFromApi[code as ApprovalStatusCode]
  }
  return 'pending'
}

export function mapApprovalStatusToApi(
  status: ApprovalStatusUi,
): ApprovalStatusCode {
  return approvalToApi[status]
}

export function mapPaymentPlanStatusFromApi(
  code: string | null | undefined,
): PaymentPlanStatusUi {
  if (code && code in paymentPlanFromApi) {
    return paymentPlanFromApi[code as PaymentPlanStatusCode]
  }
  return 'incomplete'
}

export function mapProgramStatusFromApi(
  code: string | null | undefined,
): ProgramStatusUi {
  if (code && code in programFromApi) {
    return programFromApi[code as ProgramStatusCode]
  }
  return 'ongoing'
}

export function mapProgramStatusToApi(
  status: ProgramStatusUi,
): ProgramStatusCode {
  return programToApi[status]
}

export function mapResponseStatusFromApi(
  code: string | null | undefined,
): ResponseStatusUi {
  if (code && code in responseFromApi) {
    return responseFromApi[code as ResponseStatusCode]
  }
  return 'consult'
}

export function mapResponseStatusToApi(
  status: ResponseStatusUi,
): ResponseStatusCode {
  return responseToApi[status]
}

export function mapGenderFromApi(code: string | null | undefined): GenderUi {
  return code === 'F' ? 'female' : 'male'
}

export function mapGenderToApi(gender: GenderUi | GenderCode | ''): GenderCode {
  if (gender === 'F' || gender === 'female') return 'F'
  return 'M'
}

export const COURSE_OPTIONS: { value: CourseCode; label: string }[] = [
  { value: 'TOE', label: 'TOEFL Prediction Test - ITP' },
  { value: 'IEL', label: 'IELTS Prediction Test - Academic' },
  { value: 'GET', label: 'IELTS Prediction Test - General Training' },
  { value: 'SAT', label: 'SAT Prediction Test' },
  { value: 'HSK', label: 'HSK Prediction Test' },
  { value: 'GEN', label: 'General English' },
]

const COURSE_LABELS: Record<string, string> = {
  TOE: 'TOEFL Prediction Test - ITP',
  IEL: 'IELTS Prediction Test - Academic',
  GET: 'IELTS Prediction Test - General Training',
  SAT: 'SAT Prediction Test',
  HSK: 'HSK Prediction Test',
  GEN: 'General English',
  // Legacy codes kept for display until historical rows are fully migrated
  TOR: 'TOEFL Prediction Test - ITP',
  TOG: 'TOEFL Prediction Test - ITP',
  HS1: 'HSK Prediction Test',
  HS2: 'HSK Prediction Test',
  HS3: 'HSK Prediction Test',
  HS4: 'HSK Prediction Test',
  HS5: 'HSK Prediction Test',
  HS6: 'HSK Prediction Test',
  OT: 'Other',
}

export const LANGUAGE_TEST_OPTIONS: { value: LanguageTestCode; label: string }[] =
  [
    { value: 'IELTS', label: 'IELTS' },
    { value: 'TOEFL', label: 'TOEFL' },
    { value: 'SAT', label: 'SAT' },
  ]

export const PROSPECT_RESOURCE_OPTIONS: {
  value: ProspectResource
  label: string
}[] = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Walk-in', label: 'Walk-in' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Website', label: 'Website' },
  { value: 'Google', label: 'Google' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'Other', label: 'Other' },
]

export const TELE_MARKETING_OPTIONS: {
  value: TeleMarketingCode
  label: string
}[] = [
  { value: 'WI', label: 'Walk-In (WI)' },
  { value: 'TM', label: 'Tele Marketing (TM)' },
]

export function courseLabel(code: string | null | undefined): string {
  if (!code) return '—'
  return COURSE_LABELS[code] ?? code
}

export function isToeflCourse(code: string | null | undefined): boolean {
  return code === 'TOE' || code === 'TOR' || code === 'TOG'
}

export const PREDICTION_PROGRAM_CODES = [
  'IEL_F',
  'IEL_A',
  'IEL_B',
  'TOE_G',
  'TOE_R',
  'HSK_1',
  'HSK_2',
  'HSK_3',
  'HSK_4',
  'HSK_5',
  'HSK_6',
  'GEN_A1',
  'GEN_A2',
  'GEN_B1',
  'GEN_B2',
  'GEN_C1',
  'GEN_C2',
] as const

export type PredictionProgramCode = (typeof PREDICTION_PROGRAM_CODES)[number]

export type IeltsProgramCode = Extract<
  PredictionProgramCode,
  'IEL_F' | 'IEL_A' | 'IEL_B'
>

export const IELTS_PROGRAM_OPTIONS: {
  value: IeltsProgramCode
  label: string
}[] = [
  { value: 'IEL_F', label: 'IELTS Foundation' },
  { value: 'IEL_A', label: 'IELTS A' },
  { value: 'IEL_B', label: 'IELTS B' },
]

export const TOEFL_PROGRAM_OPTIONS: {
  value: Extract<PredictionProgramCode, 'TOE_G' | 'TOE_R'>
  label: string
}[] = [
  { value: 'TOE_G', label: 'TOEFL - ITP (Green)' },
  { value: 'TOE_R', label: 'TOEFL - ITP (Red)' },
]

export const HSK_PROGRAM_OPTIONS: {
  value: Extract<
    PredictionProgramCode,
    'HSK_1' | 'HSK_2' | 'HSK_3' | 'HSK_4' | 'HSK_5' | 'HSK_6'
  >
  label: string
}[] = [
  { value: 'HSK_1', label: 'HSK 1' },
  { value: 'HSK_2', label: 'HSK 2' },
  { value: 'HSK_3', label: 'HSK 3' },
  { value: 'HSK_4', label: 'HSK 4' },
  { value: 'HSK_5', label: 'HSK 5' },
  { value: 'HSK_6', label: 'HSK 6' },
]

export const GENERAL_ENGLISH_PROGRAM_OPTIONS: {
  value: Extract<
    PredictionProgramCode,
    'GEN_A1' | 'GEN_A2' | 'GEN_B1' | 'GEN_B2' | 'GEN_C1' | 'GEN_C2'
  >
  label: string
}[] = [
  { value: 'GEN_A1', label: 'A1 (Starter)' },
  { value: 'GEN_A2', label: 'A2 (Elementary)' },
  { value: 'GEN_B1', label: 'B1 (Pre-Intermediate)' },
  { value: 'GEN_B2', label: 'B2 (Intermediate)' },
  { value: 'GEN_C1', label: 'C1 (Upper-Intermediate)' },
  { value: 'GEN_C2', label: 'C2 (Advanced)' },
]

const PREDICTION_PROGRAM_OPTIONS = [
  ...IELTS_PROGRAM_OPTIONS,
  ...TOEFL_PROGRAM_OPTIONS,
  ...HSK_PROGRAM_OPTIONS,
  ...GENERAL_ENGLISH_PROGRAM_OPTIONS,
]

export function programOptionsForCourse(code: string | null | undefined) {
  if (isIeltsCourse(code)) return IELTS_PROGRAM_OPTIONS
  if (isToeflCourse(code)) return TOEFL_PROGRAM_OPTIONS
  if (isHskCourse(code)) return HSK_PROGRAM_OPTIONS
  if (isGeneralEnglishCourse(code)) return GENERAL_ENGLISH_PROGRAM_OPTIONS
  return []
}

export function isIeltsCourse(code: string | null | undefined): boolean {
  return code === 'IEL' || code === 'GET'
}

/** IELTS Foundation and IELTS A share combined session sections. */
export function isCombinedIeltsProgram(
  code: string | null | undefined,
): boolean {
  return code === 'IEL_F' || code === 'IEL_A'
}

export function isIeltsAcademicCourse(
  code: string | null | undefined,
): boolean {
  return code === 'IEL'
}

export function isSatCourse(code: string | null | undefined): boolean {
  return code === 'SAT'
}

export function isGeneralEnglishCourse(
  code: string | null | undefined,
): boolean {
  return code === 'GEN'
}

export function isHskCourse(code: string | null | undefined): boolean {
  return (
    code === 'HSK' ||
    code === 'HS1' ||
    code === 'HS2' ||
    code === 'HS3' ||
    code === 'HS4' ||
    code === 'HS5' ||
    code === 'HS6'
  )
}

/**
 * Prediction-test language specialty for tutor assignment.
 * HSK → Mandarin; IELTS / TOEFL / SAT (and other English courses) → English.
 */
export function predictionTestStaffType(
  code: string | null | undefined,
): 'English' | 'Mandarin' | null {
  if (!code) return null
  return isHskCourse(code) ? 'Mandarin' : 'English'
}

export function ieltsProgramLabel(code: string | null | undefined): string {
  if (!code) return '—'
  return (
    PREDICTION_PROGRAM_OPTIONS.find((option) => option.value === code)?.label ??
    code
  )
}
