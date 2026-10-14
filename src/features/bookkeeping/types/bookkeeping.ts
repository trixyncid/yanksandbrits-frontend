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

export type SalaryBreakdownBranchRange = {
  branchId: number
  branchName: string
  rangeAmount: number
  payoutAmount: number
  commissionPercentage: number
  commissionBonus: number
}

/** Order in which items leave a Branch Manager's full team range. */
export type TeamRangeStep = 'prediction_test' | 'first_installment' | 'whole_plan'

/** A Branch Manager's team range: money from them and their counsellors, up to a cap. Picks only the tier bonus. */
export type TeamRange = {
  /** From the top bonus tier's max; null means no cap. */
  cap: number | null
  rangeAmount: number
  /** Everything collected before anything was taken out. */
  rawAmount: number
  teamSize: number
  contributions: { ownerName: string; isManager: boolean; amount: number }[]
  removed: {
    key: string
    kind: 'prediction_test' | 'installment'
    ownerName: string
    isManager: boolean
    paymentTitle: string
    studentName: string
    amount: number
    date: string | null
    step: TeamRangeStep
  }[]
  /** Flat tier bonus this range earns. Commission is not affected. */
  tierBonus: number
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
  branchRanges: SalaryBreakdownBranchRange[]
  /** Only set for Branch Managers. */
  teamRange: TeamRange | null
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
