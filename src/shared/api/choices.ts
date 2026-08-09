export type ApprovalStatusCode = '1_PD' | '2_AP' | '3_VD'
export type ApprovalStatusUi = 'pending' | 'approved' | 'void'

export type ProgramStatusCode = '1_OP' | '2_CL'
export type ProgramStatusUi = 'ongoing' | 'completed'

export type ResponseStatusCode =
  | '1_WT'
  | '2_FU'
  | '3_CO'
  | '4_PT'
  | '5_CA'
  | '6_EN'

export type ResponseStatusUi =
  | 'waiting'
  | 'follow_up'
  | 'consult'
  | 'prediction_test'
  | 'cancelled'
  | 'enrolled'

export type CourseCode = 'TOE' | 'GET' | 'IEL' | 'SAT' | 'HSK' | 'OT'
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

const programFromApi: Record<ProgramStatusCode, ProgramStatusUi> = {
  '1_OP': 'ongoing',
  '2_CL': 'completed',
}

const programToApi: Record<ProgramStatusUi, ProgramStatusCode> = {
  ongoing: '1_OP',
  completed: '2_CL',
}

const responseFromApi: Record<ResponseStatusCode, ResponseStatusUi> = {
  '1_WT': 'waiting',
  '2_FU': 'follow_up',
  '3_CO': 'consult',
  '4_PT': 'prediction_test',
  '5_CA': 'cancelled',
  '6_EN': 'enrolled',
}

const responseToApi: Record<ResponseStatusUi, ResponseStatusCode> = {
  waiting: '1_WT',
  follow_up: '2_FU',
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
  return 'waiting'
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
  { value: 'TOE', label: 'TOEFL Preparation Test' },
  { value: 'GET', label: 'General English' },
  { value: 'IEL', label: 'IELTS Preparation Test' },
  { value: 'SAT', label: 'SAT Preparation Test' },
  { value: 'HSK', label: 'HSK Preparation Test' },
  { value: 'OT', label: 'Other' },
]

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

export function courseLabel(code: string | null | undefined): string {
  return COURSE_OPTIONS.find((option) => option.value === code)?.label ?? code ?? '—'
}
