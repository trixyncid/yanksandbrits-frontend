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
  branch: string
}
