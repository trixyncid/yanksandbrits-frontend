export type CurrentUserProfile = {
  id: string
  pin: string
  fullName: string
  email: string
  position: string
  permissions: string[]
  birthDate: string | null
  birthPlace: string
  gender: 'male' | 'female' | null
  address: string
  mobilePhone: string
  homePhone: string
  othersPhone: string
  branch: string
  staffType: string
  dateJoined: string | null
  lastLogin: string | null
  paidLeaveLeft: number
}
