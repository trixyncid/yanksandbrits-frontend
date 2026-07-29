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
  gender: NewStudentGender
  course: string
  status: NewStudentStatus
  educationCounsellor: string
  createdAt: string
  updatedAt: string
  branch: string
}

export type NewStudentFormValues = {
  fullName: string
  email: string
  phone: string
  gender: NewStudentGender | ''
  course: string
  status: NewStudentStatus
  educationCounsellor: string
  branch: string
}

export type NewStudentFormErrors = Partial<
  Record<keyof NewStudentFormValues, string>
>
