import type { CourseCode } from '../../../shared/api/choices'

export type NewStudentStatus =
  | 'waiting'
  | 'follow_up'
  | 'consult'
  | 'prediction_test'
  | 'cancelled'

export type NewStudentGender = 'male' | 'female'

export type NewStudentListItem = {
  id: string
  fullName: string
  email: string
  phone: string
  gender: NewStudentGender | null
  course: CourseCode | string
  status: NewStudentStatus
  educationCounsellor: string
  marketingId: string | null
  createdAt: string
  updatedAt: string
  branch: string
  branchId: string | null
  isStudent: boolean
}

export type NewStudentFormValues = {
  fullName: string
  email: string
  phone: string
  gender: NewStudentGender | ''
  course: CourseCode | ''
  status: NewStudentStatus
  marketingId: string
  branchId: string
}

export type NewStudentFormErrors = Partial<
  Record<keyof NewStudentFormValues, string>
>
