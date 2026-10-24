import type {
  CourseCode,
  LanguageTestCode,
  TeleMarketingCode,
} from '../../../shared/api/choices'

export type ProspectiveStudentStatus =
  | 'consult'
  | 'prediction_test'
  | 'cancelled'
  | 'enrolled'

export type ProspectiveStudentGender = 'male' | 'female'

export type ProspectiveStudentReferralType = 'student' | 'other'

export type ProspectiveStudentListItem = {
  id: string
  fullName: string
  email: string
  phone: string
  gender: ProspectiveStudentGender | null
  course: CourseCode | string
  status: ProspectiveStudentStatus
  srNumber: string
  date: string
  resourceId: string | null
  resource: string
  referralStudentId: string | null
  referralStudentName: string
  referralName: string
  teleMarketing: TeleMarketingCode | ''
  /** Who invited a Telemarketing guest (earns TM - Consult). Null for walk-ins. */
  teleMarketerId: string | null
  teleMarketerName: string
  age: number | null
  address: string
  languageTest: LanguageTestCode | ''
  listening: string
  speaking: string
  reading: string
  writing: string
  educationCounsellor: string
  marketingId: string | null
  createdAt: string
  updatedAt: string
  branch: string
  branchId: string | null
  isStudent: boolean
  isConsult: boolean
  canEnroll: boolean
  /** The student response this student came in with. */
  responseId: string | null
  /** How many students share that response (1 when on their own). */
  responseSize: number
  /** Everyone in the response, this student included (detail view only). */
  responseStudents: { id: string; fullName: string; status: ProspectiveStudentStatus }[]
}

export type ProspectiveStudentFormValues = {
  fullName: string
  email: string
  phone: string
  gender: ProspectiveStudentGender | ''
  course: CourseCode | ''
  status: ProspectiveStudentStatus
  srNumber: string
  date: string
  resourceId: string
  referralType: ProspectiveStudentReferralType
  referralStudentId: string
  referralName: string
  teleMarketing: TeleMarketingCode | ''
  /** Empty means the same person as the education counsellor. */
  teleMarketerId: string
  age: string
  address: string
  hasTakenLanguageTest: boolean
  languageTest: LanguageTestCode | ''
  listening: string
  speaking: string
  reading: string
  writing: string
  marketingId: string
  branchId: string
}

export type ProspectiveStudentFormErrors = Partial<
  Record<keyof ProspectiveStudentFormValues, string>
>

/**
 * Another student in the same student response. They share the first
 * student's Consult & Source details and only need their own personal ones.
 */
export type ExtraStudentValues = {
  key: string
  fullName: string
  email: string
  phone: string
  gender: ProspectiveStudentGender | ''
  age: string
  course: CourseCode | ''
  status: Exclude<ProspectiveStudentStatus, 'enrolled'>
  srNumber: string
  address: string
}

export type ExtraStudentErrors = Partial<Record<keyof ExtraStudentValues, string>>
