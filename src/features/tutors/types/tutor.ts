import type { EmploymentTypeCode } from '../../users/api/users-api'

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
  /** Freelancers (FL) have no working hours or paid leave. */
  employmentType: EmploymentTypeCode | null
}
