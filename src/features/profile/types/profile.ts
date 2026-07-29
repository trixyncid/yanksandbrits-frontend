export type CurrentUserProfile = {
  id: string
  pin: string
  fullName: string
  email: string
  position: string
  permissions: string[]
  birthDate: string
  birthPlace: string
  gender: 'male' | 'female'
  address: string
  mobilePhone: string
  homePhone: string
  othersPhone: string
  branch: string
  staffType: string
  dateJoined: string
  lastLogin: string
  paidLeaveLeft: number
}
