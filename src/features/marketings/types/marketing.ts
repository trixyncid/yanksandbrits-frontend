export type MarketingGender = 'male' | 'female'

export type MarketingRole = {
  code: string
  name: string
}

export type MarketingListItem = {
  id: string
  pin: string
  fullName: string
  email: string
  phone: string
  gender: MarketingGender
  isActive: boolean
  paidLeaveLeft: number
  hasSalary: boolean
  branch: string
  roles: MarketingRole[]
}
