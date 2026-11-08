export type FinancePeriodOption = {
  id: string
  title: string
  startDate: string
  endDate: string
  status: string
}

export type FinanceKpiValue = {
  current: number
  previous: number
  changePct: number | null
}

export type FinanceEarnings = {
  mainSalary: number
  commissionSalary: number
  enrollmentCount: number
  /** Commission paid per new student in this period. */
  commissionFee: number
  expectedSalary: number
  /** True when the pay comes from the saved bookkeeping row. */
  isSaved: boolean
}

export type FinancePendingQueue = {
  count: number
  amount: number
  /** Waiting longer than the stale threshold. */
  staleCount: number
  oldestDays: number | null
}

export type FinancePerformanceMetrics = {
  period: {
    label: string
    start: string
    end: string
    isOpenPeriod: boolean
    bookkeepingId: number | null
    /** Empty when the period covers every branch. */
    branchName: string
  }
  defaultPeriod: string
  comparisonPeriod: { label: string; start: string; end: string }
  availablePeriods: FinancePeriodOption[]
  kpis: {
    expectedPay: FinanceKpiValue
    newStudents: FinanceKpiValue
    tuitionCollected: FinanceKpiValue
    paymentsVerified: FinanceKpiValue
  }
  earnings: FinanceEarnings
  enrollmentTrend: { weekStart: string; label: string; enrollments: number }[]
  verification: {
    installments: number
    predictionTests: number
    amount: number
    avgTurnaroundHours: number | null
    previousAvgTurnaroundHours: number | null
    /** First recorded approval; earlier approvals have no approver. */
    trackingSince: string | null
  }
  collections: {
    amount: number
    installments: number
    voidedInstallments: number
  }
  queue: {
    installments: FinancePendingQueue
    predictionTests: FinancePendingQueue
    staleAfterDays: number
  }
}

export const FINANCE_ANCHORS = {
  pay: 'finance-pay',
  work: 'finance-work',
  money: 'finance-money',
} as const
