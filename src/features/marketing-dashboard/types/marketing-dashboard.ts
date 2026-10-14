import type { SalaryBreakdownMarketer } from '../../bookkeeping/types/bookkeeping'

export type MarketingPeriodOption = {
  id: string
  title: string
  startDate: string
  endDate: string
  status: string
}

export type MarketingPeriodInfo = {
  label: string
  start: string
  end: string
  isOpenPeriod: boolean
  periodType: string
  bookkeepingId: number | null
}

export type MarketingKpiValue = {
  current: number
  previous: number
  changePct: number | null
}

export type MarketingSpifProgress = {
  count: number
  threshold: number
  units: number
  remaining: number
  progressPct: number
}

export type MarketingStudentPayments = {
  completed: number
  incomplete: number
  previousCompleted: number
  previousIncomplete: number
  changePct: number | null
}

export type MarketingFunnelItem = {
  status: string
  label: string
  count: number
}

export type MarketingLeadSource = {
  source: string
  label: string
  leads: number
  consults: number
  enrollments: number
  conversionRate: number
}

export type MarketingStaleProspect = {
  id: number
  name: string
  status: string
  resource: string
  updatedAt: string
}

export type MarketingPipeline = {
  active: number
  staleCount: number
  stale: MarketingStaleProspect[]
}

export type MarketingPerformanceMetrics = {
  period: MarketingPeriodInfo
  /** Resolved default for the period picker (`open` or bookkeeping id). */
  defaultPeriod: string
  comparisonPeriod: {
    label: string
    start: string
    end: string
  }
  availablePeriods: MarketingPeriodOption[]
  kpis: {
    newLeads: MarketingKpiValue
    consults: MarketingKpiValue
    enrollments: MarketingKpiValue
    consultToEnrollRate: MarketingKpiValue
    expectedPay: MarketingKpiValue
    studentPayments: MarketingStudentPayments
    spifProgress: MarketingSpifProgress
  }
  funnel: MarketingFunnelItem[]
  pipeline: MarketingPipeline
  leadSources: MarketingLeadSource[]
  earnings: SalaryBreakdownMarketer | null
  earningsMeta: {
    period: string
    isOpenPeriod: boolean
    startDate: string
    endDate: string
  }
}

/** Ids of the cards the hero arrows scroll to. */
export const MARKETING_ANCHORS = {
  funnel: 'marketing-funnel',
  goals: 'marketing-goals',
  pay: 'marketing-pay',
} as const
