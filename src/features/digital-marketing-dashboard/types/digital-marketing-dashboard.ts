import type {
  FinanceEarnings,
  FinanceKpiValue,
  FinancePeriodOption,
} from '../../finance-dashboard/types/finance-dashboard'

export type DigitalMarketingFunnel = {
  /** Student responses created in the period. */
  leads: number
  /** Student responses consulted in the period. */
  consulted: number
  /** Students enrolled in the period; each one earns commission. */
  enrolled: number
}

export type DigitalMarketingSource = DigitalMarketingFunnel & { source: string }

export type DigitalMarketingStudent = {
  id: number
  fullName: string
  srNumber: string
  source: string
  branchName: string
  counsellorName: string
  enrollmentDate: string
}

export type DigitalMarketingPerformanceMetrics = {
  period: {
    label: string
    start: string
    end: string
    isOpenPeriod: boolean
    bookkeepingId: number | null
  }
  defaultPeriod: string
  comparisonPeriod: { label: string; start: string; end: string }
  availablePeriods: FinancePeriodOption[]
  kpis: {
    expectedPay: FinanceKpiValue
    newStudents: FinanceKpiValue
    leads: FinanceKpiValue
    consulted: FinanceKpiValue
  }
  earnings: FinanceEarnings
  funnel: DigitalMarketingFunnel
  sources: DigitalMarketingSource[]
  /** Names of the lead sources marked for Digital Marketing. */
  trackedSources: string[]
  enrollmentTrend: { weekStart: string; label: string; enrollments: number }[]
  students: DigitalMarketingStudent[]
}

export const DIGITAL_MARKETING_ANCHORS = {
  pay: 'digital-marketing-pay',
  leads: 'digital-marketing-leads',
  students: 'digital-marketing-students',
} as const
