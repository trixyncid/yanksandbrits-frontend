export type StaffPosition =
  | 'superuser'
  | 'manager'
  | 'marketing'
  | 'tutor'
  | 'staff'

export type StaffGender = 'male' | 'female'

export type StaffListItem = {
  id: string
  pin: string
  fullName: string
  email: string
  gender: StaffGender
  position: StaffPosition
  isActive: boolean
  paidLeaveLeft: number
  lastLogin: string | null
  dateJoined: string
  branch: string
}
