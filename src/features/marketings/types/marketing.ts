export type MarketingGender = 'male' | 'female'

export type MarketingListItem = {
  id: string
  pin: string
  fullName: string
  email: string
  phone: string
  gender: MarketingGender
  isActive: boolean
  lastLogin: string | null
  dateJoined: string
  paidLeaveLeft: number
  hasSalary: boolean
  branch: string
}
