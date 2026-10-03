export type BookkeepingStatus = 'pending' | 'approved' | 'void'

export type BookkeepingListItem = {
  id: string
  startDate: string
  endDate: string
  status: BookkeepingStatus
  title: string
  branchId: string | null
  branchName: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export type BookkeepingDetail = BookkeepingListItem

export type BookkeepingFormValues = {
  startDate: string
  endDate: string
  title: string
  status: BookkeepingStatus
  branchId: string
}

export type BookkeepingFormErrors = Partial<
  Record<keyof BookkeepingFormValues, string>
>

export type BookkeepingTutorSalaryItem = {
  id: string
  tutorPin: string
  tutorName: string
  tutorEmail: string
  workingDays: number
  mainSalary: number
  sessions: number
  sessionSalary: number
  overtimeSessions: number
  overtimeSalary: number
  totalSalary: number
}

export type BookkeepingMarketingSalaryItem = {
  id: string
  marketerPin: string
  marketerName: string
  email: string
  totalStudent: number
  mainSalary: number
  bonusSalary: number
  totalSalary: number
}

export type SalaryBreakdownConsultFee = {
  id: string
  name: string
  date: string | null
  resource: string
  amount: number
}

export type SalaryBreakdownEnrollmentFee = {
  id: string
  name: string
  enrollmentDate: string | null
  consultDate: string | null
  amount: number
}

export type SalaryBreakdownMarketer = {
  marketerId: string
  marketerPin: string
  marketerName: string
  email: string
  mainSalary: number
  consultCount: number
  consultTotal: number
  enrollmentCount: number
  enrollmentTotal: number
  feesTotal: number
  spifTotal: number
  spifProspectCount: number
  spifThreshold: number
  spifUnits: number
  periodType: '4W' | '5W' | string
  rangeAmount: number
  payoutAmount: number
  commissionPercentage: number
  tierMinAmount: number | null
  tierMaxAmount: number | null
  commissionBonus: number
  tierBonus: number
  bonusTierMinAmount: number | null
  bonusTierMaxAmount: number | null
  expectedSalary: number
  consults: SalaryBreakdownConsultFee[]
  enrollments: SalaryBreakdownEnrollmentFee[]
}

export type SalaryBreakdownMeta = {
  total: number
  startDate: string
  endDate: string
  period: string
  totalMainSalary: number
  totalConsultFees: number
  totalEnrollmentFees: number
  totalSpif: number
  totalCommissionBonus: number
  totalTierBonus: number
  totalRangeAmount: number
  totalExpectedSalary: number
  consultCount: number
  enrollmentCount: number
  spifProspectCount: number
}

export type SalaryBreakdownResponse = {
  data: SalaryBreakdownMarketer[]
  meta: SalaryBreakdownMeta
}
