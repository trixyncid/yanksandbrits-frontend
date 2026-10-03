import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type { SalaryBreakdownMarketer } from '../../bookkeeping/types/bookkeeping'
import type { MarketingPerformanceMetrics } from '../types/marketing-dashboard'

type SalaryBreakdownMarketerDto = {
  marketing: number
  marketing_name?: string | null
  marketing_pin?: string | null
  marketing_email?: string | null
  main_salary?: number
  consult_count?: number
  consult_total?: number
  enrollment_count?: number
  enrollment_total?: number
  fees_total?: number
  spif_total?: number
  spif_prospect_count?: number
  spif_threshold?: number
  spif_units?: number
  period_type?: string | null
  range_amount?: number
  payout_amount?: number
  commission_percentage?: number
  tier_min_amount?: number | null
  tier_max_amount?: number | null
  commission_bonus?: number
  tier_bonus?: number
  bonus_tier_min_amount?: number | null
  bonus_tier_max_amount?: number | null
  expected_salary: number
  consults: Array<{
    id: number
    name: string
    date: string | null
    resource?: string | null
    amount: number
  }>
  enrollments: Array<{
    id: number
    name: string
    enrollment_date: string | null
    consult_date: string | null
    amount: number
  }>
}

type MarketingPerformanceDto = {
  period: {
    label: string
    start: string
    end: string
    is_open_period: boolean
    period_type: string
    bookkeeping_id: number | null
  }
  default_period?: string
  comparison_period: {
    label: string
    start: string
    end: string
  }
  available_periods: Array<{
    id: number
    title: string
    start_date: string
    end_date: string
    status: string
  }>
  kpis: {
    new_leads: {
      current: number
      previous: number
      change_pct: number | null
    }
    consults: {
      current: number
      previous: number
      change_pct: number | null
    }
    enrollments: {
      current: number
      previous: number
      change_pct: number | null
    }
    consult_to_enroll_rate: {
      current: number
      previous: number
      change_pct: number | null
    }
    expected_pay: {
      current: number
      previous: number
      change_pct: number | null
    }
    student_payments: {
      completed: number
      incomplete: number
      previous_completed: number
      previous_incomplete: number
      change_pct: number | null
    }
    spif_progress: {
      count: number
      threshold: number
      units: number
      remaining: number
      progress_pct: number
    }
  }
  funnel: Array<{ status: string; label: string; count: number }>
  pipeline: {
    active: number
    stale_count: number
    stale: Array<{
      id: number
      name: string
      status: string
      resource: string
      updated_at: string
    }>
  }
  lead_sources: Array<{
    source: string
    label: string
    leads: number
    consults: number
    enrollments: number
    conversion_rate: number
    counts_toward_pay: boolean
  }>
  earnings: SalaryBreakdownMarketerDto | null
  earnings_meta: {
    period: string
    is_open_period: boolean
    start_date: string
    end_date: string
  }
}

function mapEarnings(
  dto: SalaryBreakdownMarketerDto | null,
): SalaryBreakdownMarketer | null {
  if (!dto) {
    return null
  }
  return {
    marketerId: String(dto.marketing),
    marketerPin: dto.marketing_pin ?? '—',
    marketerName: dto.marketing_name ?? '—',
    email: dto.marketing_email ?? '—',
    mainSalary: dto.main_salary ?? 0,
    consultCount: dto.consult_count ?? 0,
    consultTotal: dto.consult_total ?? 0,
    enrollmentCount: dto.enrollment_count ?? 0,
    enrollmentTotal: dto.enrollment_total ?? 0,
    feesTotal: dto.fees_total ?? 0,
    spifTotal: dto.spif_total ?? 0,
    spifProspectCount: dto.spif_prospect_count ?? 0,
    spifThreshold: dto.spif_threshold ?? 0,
    spifUnits: dto.spif_units ?? 0,
    periodType: dto.period_type ?? '4W',
    rangeAmount: dto.range_amount ?? 0,
    payoutAmount: dto.payout_amount ?? 0,
    commissionPercentage: dto.commission_percentage ?? 0,
    tierMinAmount: dto.tier_min_amount ?? null,
    tierMaxAmount: dto.tier_max_amount ?? null,
    commissionBonus: dto.commission_bonus ?? 0,
    tierBonus: dto.tier_bonus ?? 0,
    bonusTierMinAmount: dto.bonus_tier_min_amount ?? null,
    bonusTierMaxAmount: dto.bonus_tier_max_amount ?? null,
    expectedSalary: dto.expected_salary ?? 0,
    consults: (dto.consults ?? []).map((item) => ({
      id: String(item.id),
      name: item.name,
      date: item.date,
      resource: item.resource ?? '',
      amount: item.amount ?? 0,
    })),
    enrollments: (dto.enrollments ?? []).map((item) => ({
      id: String(item.id),
      name: item.name,
      enrollmentDate: item.enrollment_date,
      consultDate: item.consult_date,
      amount: item.amount ?? 0,
    })),
  }
}

function mapMetrics(dto: MarketingPerformanceDto): MarketingPerformanceMetrics {
  return {
    period: {
      label: dto.period.label,
      start: dto.period.start,
      end: dto.period.end,
      isOpenPeriod: dto.period.is_open_period,
      periodType: dto.period.period_type,
      bookkeepingId: dto.period.bookkeeping_id,
    },
    defaultPeriod:
      dto.default_period === 'open' || !dto.default_period
        ? 'open'
        : String(dto.default_period),
    comparisonPeriod: {
      label: dto.comparison_period.label,
      start: dto.comparison_period.start,
      end: dto.comparison_period.end,
    },
    availablePeriods: (dto.available_periods ?? []).map((item) => ({
      id: String(item.id),
      title: item.title ?? '',
      startDate: item.start_date,
      endDate: item.end_date,
      status: item.status,
    })),
    kpis: {
      newLeads: {
        current: dto.kpis.new_leads.current,
        previous: dto.kpis.new_leads.previous,
        changePct: dto.kpis.new_leads.change_pct,
      },
      consults: {
        current: dto.kpis.consults.current,
        previous: dto.kpis.consults.previous,
        changePct: dto.kpis.consults.change_pct,
      },
      enrollments: {
        current: dto.kpis.enrollments.current,
        previous: dto.kpis.enrollments.previous,
        changePct: dto.kpis.enrollments.change_pct,
      },
      consultToEnrollRate: {
        current: dto.kpis.consult_to_enroll_rate.current,
        previous: dto.kpis.consult_to_enroll_rate.previous,
        changePct: dto.kpis.consult_to_enroll_rate.change_pct,
      },
      expectedPay: {
        current: dto.kpis.expected_pay.current,
        previous: dto.kpis.expected_pay.previous,
        changePct: dto.kpis.expected_pay.change_pct,
      },
      studentPayments: {
        completed: dto.kpis.student_payments?.completed ?? 0,
        incomplete: dto.kpis.student_payments?.incomplete ?? 0,
        previousCompleted: dto.kpis.student_payments?.previous_completed ?? 0,
        previousIncomplete: dto.kpis.student_payments?.previous_incomplete ?? 0,
        changePct: dto.kpis.student_payments?.change_pct ?? null,
      },
      spifProgress: {
        count: dto.kpis.spif_progress.count,
        threshold: dto.kpis.spif_progress.threshold,
        units: dto.kpis.spif_progress.units,
        remaining: dto.kpis.spif_progress.remaining,
        progressPct: dto.kpis.spif_progress.progress_pct,
      },
    },
    funnel: dto.funnel.map((item) => ({
      status: item.status,
      label: item.label,
      count: item.count,
    })),
    pipeline: {
      active: dto.pipeline.active,
      staleCount: dto.pipeline.stale_count,
      stale: dto.pipeline.stale.map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        resource: item.resource,
        updatedAt: item.updated_at,
      })),
    },
    leadSources: dto.lead_sources.map((item) => ({
      source: item.source,
      label: item.label,
      leads: item.leads,
      consults: item.consults,
      enrollments: item.enrollments,
      conversionRate: item.conversion_rate,
      countsTowardPay: item.counts_toward_pay,
    })),
    earnings: mapEarnings(dto.earnings),
    earningsMeta: {
      period: dto.earnings_meta.period,
      isOpenPeriod: dto.earnings_meta.is_open_period,
      startDate: dto.earnings_meta.start_date,
      endDate: dto.earnings_meta.end_date,
    },
  }
}

export async function fetchMarketingPerformanceMetrics(
  bookkeepingId: string,
): Promise<MarketingPerformanceMetrics> {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<MarketingPerformanceDto>
  >(adminPath('/marketing-dashboard/metrics'), {
    params: {
      bookkeeping: bookkeepingId || 'auto',
    },
  })

  return mapMetrics(data.data)
}
