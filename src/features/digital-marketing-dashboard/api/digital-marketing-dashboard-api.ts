import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type { FinanceKpiValue } from '../../finance-dashboard/types/finance-dashboard'
import type { DigitalMarketingPerformanceMetrics } from '../types/digital-marketing-dashboard'

type KpiDto = { current: number; previous: number; change_pct: number | null }

type FunnelDto = { leads: number; consulted: number; enrolled: number }

type DigitalMarketingPerformanceDto = {
  period: {
    label: string
    start: string
    end: string
    is_open_period: boolean
    bookkeeping_id: number | null
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
    leads: KpiDto
    consulted: KpiDto
  }
  earnings: {
    main_salary: number
    commission_salary: number
    enrollment_count: number
    commission_fee: number
    expected_salary: number
    is_saved: boolean
  }
  funnel: FunnelDto
  sources: Array<FunnelDto & { source: string }>
  tracked_sources: string[]
  enrollment_trend: Array<{ week_start: string; label: string; enrollments: number }>
  students: Array<{
    id: number
    full_name: string
    sr_number: string
    source: string
    branch_name: string
    counsellor_name: string
    enrollment_date: string
  }>
}

function mapKpi(dto: KpiDto): FinanceKpiValue {
  return { current: dto.current, previous: dto.previous, changePct: dto.change_pct }
}

function mapMetrics(dto: DigitalMarketingPerformanceDto): DigitalMarketingPerformanceMetrics {
  return {
    period: {
      label: dto.period.label,
      start: dto.period.start,
      end: dto.period.end,
      isOpenPeriod: dto.period.is_open_period,
      bookkeepingId: dto.period.bookkeeping_id,
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
      leads: mapKpi(dto.kpis.leads),
      consulted: mapKpi(dto.kpis.consulted),
    },
    earnings: {
      mainSalary: dto.earnings.main_salary,
      commissionSalary: dto.earnings.commission_salary,
      enrollmentCount: dto.earnings.enrollment_count,
      commissionFee: dto.earnings.commission_fee,
      expectedSalary: dto.earnings.expected_salary,
      isSaved: dto.earnings.is_saved,
    },
    funnel: dto.funnel,
    sources: dto.sources,
    trackedSources: dto.tracked_sources,
    enrollmentTrend: dto.enrollment_trend.map((week) => ({
      weekStart: week.week_start,
      label: week.label,
      enrollments: week.enrollments,
    })),
    students: dto.students.map((student) => ({
      id: student.id,
      fullName: student.full_name,
      srNumber: student.sr_number,
      source: student.source,
      branchName: student.branch_name,
      counsellorName: student.counsellor_name,
      enrollmentDate: student.enrollment_date,
    })),
  }
}

export async function fetchDigitalMarketingPerformanceMetrics(
  bookkeepingId: string,
): Promise<DigitalMarketingPerformanceMetrics> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<DigitalMarketingPerformanceDto>>(
    adminPath('/digital-marketing-dashboard/metrics'),
    { params: { bookkeeping: bookkeepingId } },
  )
  return mapMetrics(data.data)
}
