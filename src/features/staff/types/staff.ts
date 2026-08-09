export type StaffPosition =
  | 'superuser'
  | 'manager'
  | 'marketing'
  | 'tutor'
  | 'student'
  | 'staff'

export type StaffGender = 'male' | 'female'

export type StaffListItem = {
  id: string
  pin: string | null
  fullName: string
  email: string
  gender: StaffGender
  position: StaffPosition
  isActive: boolean
  isStudent: boolean
  studentId: string | null
  paidLeaveLeft: number
  lastLogin: string | null
  dateJoined: string
  branch: string
}
