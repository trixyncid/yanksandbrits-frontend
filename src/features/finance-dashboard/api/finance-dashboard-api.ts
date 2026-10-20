import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type {
  FinanceKpiValue,
  FinancePendingQueue,
  FinancePerformanceMetrics,
} from '../types/finance-dashboard'

type KpiDto = { current: number; previous: number; change_pct: number | null }

type PendingDto = {
  count: number
  amount: number
  stale_count: number
  oldest_days: number | null
}

type FinancePerformanceDto = {
  period: {
    label: string
    start: string
    end: string
    is_open_period: boolean
    bookkeeping_id: number | null
    branch_name: string
  }
  default_period?: string
  comparison_period: { label: string; start: string; end: string }
  available_periods: Array<{
    id: number
    title: string
    start_date: string
    end_date: string
    status: string
  }>
  kpis: {
    expected_pay: KpiDto
    new_students: KpiDto
    tuition_collected: KpiDto
    payments_verified: KpiDto
  }
  earnings: {
    main_salary: number
    commission_salary: number
    enrollment_count: number
    commission_fee: number
    expected_salary: number
    is_saved: boolean
  }
  enrollment_trend: Array<{ week_start: string; label: string; enrollments: number }>
  verification: {
    installments: number
    prediction_tests: number
    amount: number
    avg_turnaround_hours: number | null
    previous_avg_turnaround_hours: number | null
    tracking_since: string | null
  }
  collections: {
    amount: number
    installments: number
    voided_installments: number
  }
  queue: {
    installments: PendingDto
    prediction_tests: PendingDto
    stale_after_days: number
  }
}

function mapKpi(dto: KpiDto): FinanceKpiValue {
  return { current: dto.current, previous: dto.previous, changePct: dto.change_pct }
}

function mapPending(dto: PendingDto): FinancePendingQueue {
  return {
    count: dto.count,
    amount: dto.amount,
    staleCount: dto.stale_count,
    oldestDays: dto.oldest_days,
  }
}

function mapMetrics(dto: FinancePerformanceDto): FinancePerformanceMetrics {
  return {
    period: {
      label: dto.period.label,
      start: dto.period.start,
      end: dto.period.end,
      isOpenPeriod: dto.period.is_open_period,
      bookkeepingId: dto.period.bookkeeping_id,
      branchName: dto.period.branch_name ?? '',
    },
    defaultPeriod: dto.default_period ?? 'open',
    comparisonPeriod: dto.comparison_period,
    availablePeriods: dto.available_periods.map((period) => ({
      id: String(period.id),
      title: period.title,
      startDate: period.start_date,
      endDate: period.end_date,
      status: period.status,
    })),
    kpis: {
      expectedPay: mapKpi(dto.kpis.expected_pay),
      newStudents: mapKpi(dto.kpis.new_students),
      tuitionCollected: mapKpi(dto.kpis.tuition_collected),
      paymentsVerified: mapKpi(dto.kpis.payments_verified),
    },
    earnings: {
      mainSalary: dto.earnings.main_salary,
      commissionSalary: dto.earnings.commission_salary,
      enrollmentCount: dto.earnings.enrollment_count,
      commissionFee: dto.earnings.commission_fee,
      expectedSalary: dto.earnings.expected_salary,
      isSaved: dto.earnings.is_saved,
    },
    enrollmentTrend: dto.enrollment_trend.map((week) => ({
      weekStart: week.week_start,
      label: week.label,
      enrollments: week.enrollments,
    })),
    verification: {
      installments: dto.verification.installments,
      predictionTests: dto.verification.prediction_tests,
      amount: dto.verification.amount,
      avgTurnaroundHours: dto.verification.avg_turnaround_hours,
      previousAvgTurnaroundHours: dto.verification.previous_avg_turnaround_hours,
      trackingSince: dto.verification.tracking_since,
    },
    collections: {
      amount: dto.collections.amount,
      installments: dto.collections.installments,
      voidedInstallments: dto.collections.voided_installments,
    },
    queue: {
      installments: mapPending(dto.queue.installments),
      predictionTests: mapPending(dto.queue.prediction_tests),
      staleAfterDays: dto.queue.stale_after_days,
    },
  }
}

export async function fetchFinancePerformanceMetrics(
  bookkeepingId: string,
): Promise<FinancePerformanceMetrics> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<FinancePerformanceDto>>(
    adminPath('/finance-dashboard/metrics'),
    { params: { bookkeeping: bookkeepingId } },
  )
  return mapMetrics(data.data)
}
