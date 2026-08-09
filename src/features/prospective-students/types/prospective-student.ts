import type {
  CourseCode,
  LanguageTestCode,
  ProspectResource,
} from '../../../shared/api/choices'

export type ProspectiveStudentStatus =
  | 'waiting'
  | 'follow_up'
  | 'consult'
  | 'prediction_test'
  | 'cancelled'
  | 'enrolled'

export type ProspectiveStudentGender = 'male' | 'female'

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
  resource: ProspectResource | string
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
  resource: ProspectResource | ''
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
