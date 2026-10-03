import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type {
  TutorEarnings,
  TutorPerformanceMetrics,
} from '../types/tutor-dashboard'

type TutorKpiDto = {
  current: number
  previous: number
  change_pct: number | null
}

type TutorPerformanceDto = {
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
    expected_pay: TutorKpiDto
    finished_sessions: TutorKpiDto
    hours_taught: TutorKpiDto
    cancellation_rate: TutorKpiDto
    student_attendance_rate: TutorKpiDto
    bonus_progress: {
      session_count: number
      current_tier_min: number | null
      current_tier_max: number | null
      next_tier_min: number | null
      remaining: number
      progress_pct: number
      bonus_amount: number
    }
  }
  workload: {
    working_days: number
    overtime_sessions: number
    regular_sessions: number
    sessions_per_day: number
    cancelled_sessions: number
  }
  program_mix: Array<{
    program_id: number | null
    title: string
    sessions: number
    hours: number
  }>
  weekly_trend: Array<{
    week_start: string
    label: string
    sessions: number
    hours: number
  }>
  cancellations: Array<{
    id: number
    date: string
    start_time: string
    program: string
    subject: string
    subject_type: string
  }>
  earnings: {
    tutor_id: number | null
    tutor_name: string | null
    tutor_pin: string | null
    working_days: number
    main_salary: number
    number_sessions: number
    session_salary: number
    overtime_sessions: number
    overtime_salary: number
    bonus_salary: number
    expected_salary: number
  } | null
  earnings_meta: {
    period: string
    is_open_period: boolean
    start_date: string
    end_date: string
  }
}

function mapKpi(dto: TutorKpiDto) {
  return {
    current: dto.current,
    previous: dto.previous,
    changePct: dto.change_pct,
  }
}

function mapEarnings(
  dto: TutorPerformanceDto['earnings'],
): TutorEarnings {
  if (!dto) {
    return {
      tutorId: null,
      tutorName: null,
      tutorPin: null,
      workingDays: 0,
      mainSalary: 0,
      numberSessions: 0,
      sessionSalary: 0,
      overtimeSessions: 0,
      overtimeSalary: 0,
      bonusSalary: 0,
      expectedSalary: 0,
    }
  }
  return {
    tutorId: dto.tutor_id,
    tutorName: dto.tutor_name,
    tutorPin: dto.tutor_pin,
    workingDays: dto.working_days ?? 0,
    mainSalary: dto.main_salary ?? 0,
    numberSessions: dto.number_sessions ?? 0,
    sessionSalary: dto.session_salary ?? 0,
    overtimeSessions: dto.overtime_sessions ?? 0,
    overtimeSalary: dto.overtime_salary ?? 0,
    bonusSalary: dto.bonus_salary ?? 0,
    expectedSalary: dto.expected_salary ?? 0,
  }
}

function mapMetrics(dto: TutorPerformanceDto): TutorPerformanceMetrics {
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
      expectedPay: mapKpi(dto.kpis.expected_pay),
      finishedSessions: mapKpi(dto.kpis.finished_sessions),
      hoursTaught: mapKpi(dto.kpis.hours_taught),
      cancellationRate: mapKpi(dto.kpis.cancellation_rate),
      studentAttendanceRate: mapKpi(dto.kpis.student_attendance_rate),
      bonusProgress: {
        sessionCount: dto.kpis.bonus_progress.session_count,
        currentTierMin: dto.kpis.bonus_progress.current_tier_min,
        currentTierMax: dto.kpis.bonus_progress.current_tier_max,
        nextTierMin: dto.kpis.bonus_progress.next_tier_min,
        remaining: dto.kpis.bonus_progress.remaining,
        progressPct: dto.kpis.bonus_progress.progress_pct,
        bonusAmount: dto.kpis.bonus_progress.bonus_amount,
      },
    },
    workload: {
      workingDays: dto.workload.working_days,
      overtimeSessions: dto.workload.overtime_sessions,
      regularSessions: dto.workload.regular_sessions,
      sessionsPerDay: dto.workload.sessions_per_day,
      cancelledSessions: dto.workload.cancelled_sessions,
    },
    programMix: (dto.program_mix ?? []).map((item) => ({
      programId: item.program_id,
      title: item.title,
      sessions: item.sessions,
      hours: item.hours,
    })),
    weeklyTrend: (dto.weekly_trend ?? []).map((item) => ({
      weekStart: item.week_start,
      label: item.label,
      sessions: item.sessions,
      hours: item.hours,
    })),
    cancellations: (dto.cancellations ?? []).map((item) => ({
      id: item.id,
      date: item.date,
      startTime: item.start_time,
      program: item.program,
      subject: item.subject,
      subjectType: item.subject_type,
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

export async function fetchTutorPerformanceMetrics(
  bookkeepingId: string,
): Promise<TutorPerformanceMetrics> {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<TutorPerformanceDto>
  >(adminPath('/tutor-dashboard/metrics'), {
    params: {
      bookkeeping: bookkeepingId || 'auto',
    },
  })

  return mapMetrics(data.data)
}
