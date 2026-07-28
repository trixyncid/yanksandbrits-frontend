export type TutorGender = 'male' | 'female'

export type TutorListItem = {
  id: string
  pin: string
  fullName: string
  email: string
  phone: string
  gender: TutorGender
  isActive: boolean
  lastLogin: string | null
  dateJoined: string
  paidLeaveLeft: number
  hasWorkingSchedule: boolean
}
