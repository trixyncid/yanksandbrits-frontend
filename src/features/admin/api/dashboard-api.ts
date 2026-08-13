import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import type { DashboardFilters, DashboardMetrics } from '../types/dashboard'
import { isAllBranches } from '../types/dashboard'

type DashboardMetricsDto = {
  date_range: { start: string; end: string }
  comparison_range: { start: string; end: string }
  branch_id: number | null
  kpis: {
    revenue: {
      current: number
      previous: number
      change_pct: number | null
      student_payments: number
      prediction_tests: number
    }
    new_enrollments: {
      current: number
      previous: number
      change_pct: number | null
    }
    active_students: number
    conversion_rate: number | null
    pending_collections: {
      amount: number
      count: number
    }
  }
  operations: {
    sessions_total: number
    sessions_finished: number
    sessions_cancelled: number
    cancellation_rate: number
  }
  prospect_funnel: {
    status: string
    label: string
    count: number
  }[]
  trends: {
    revenue: { month: string; revenue: number }[]
    enrollments: { month: string; enrollments: number }[]
  }
  actions: {
    pending_payments: number
    pending_leave: number
    stale_prospects: number
  }
  lead_sources: {
    source: string
    label: string
    leads: number
    enrolled: number
    conversion_rate: number
  }[]
  marketing_attribution: {
    marketing_id: number | null
    name: string
    leads: number
    enrolled: number
    conversion_rate: number
  }[]
  course_interest: {
    course: string
    label: string
    count: number
  }[]
  branch_comparison: {
    branch_id: number
    branch_name: string
    revenue: number
    new_enrollments: number
    active_students: number
    leads: number
    conversion_rate: number | null
  }[]
  delivery: {
    attendance_rate: number | null
    attendance_present: number
    attendance_total: number
    overtime_sessions: number
    unassigned_tutor_sessions: number
    program_demand: {
      program_id: number | null
      title: string
      sessions: number
      enrollments: number
    }[]
    tutor_utilization: {
      tutor_id: number | null
      name: string
      sessions: number
      hours: number
    }[]
    classroom_utilization: {
      classroom_id: number | null
      name: string
      sessions: number
      booked_hours: number
      utilization_rate: number
    }[]
  }
}

function mapDashboardMetrics(dto: DashboardMetricsDto): DashboardMetrics {
  return {
    dateRange: dto.date_range,
    comparisonRange: dto.comparison_range,
    branchId: dto.branch_id,
    kpis: {
      revenue: {
        current: dto.kpis.revenue.current,
        previous: dto.kpis.revenue.previous,
        changePct: dto.kpis.revenue.change_pct,
        studentPayments: dto.kpis.revenue.student_payments,
        predictionTests: dto.kpis.revenue.prediction_tests,
      },
      newEnrollments: {
        current: dto.kpis.new_enrollments.current,
        previous: dto.kpis.new_enrollments.previous,
        changePct: dto.kpis.new_enrollments.change_pct,
      },
      activeStudents: dto.kpis.active_students,
      conversionRate: dto.kpis.conversion_rate,
      pendingCollections: {
        amount: dto.kpis.pending_collections.amount,
        count: dto.kpis.pending_collections.count,
      },
    },
    operations: {
      sessionsTotal: dto.operations.sessions_total,
      sessionsFinished: dto.operations.sessions_finished,
      sessionsCancelled: dto.operations.sessions_cancelled,
      cancellationRate: dto.operations.cancellation_rate,
    },
    prospectFunnel: dto.prospect_funnel,
    trends: dto.trends,
    actions: {
      pendingPayments: dto.actions.pending_payments,
      pendingLeave: dto.actions.pending_leave,
      staleProspects: dto.actions.stale_prospects,
    },
    leadSources: dto.lead_sources.map((item) => ({
      source: item.source,
      label: item.label,
      leads: item.leads,
      enrolled: item.enrolled,
      conversionRate: item.conversion_rate,
    })),
    marketingAttribution: dto.marketing_attribution.map((item) => ({
      marketingId: item.marketing_id,
      name: item.name,
      leads: item.leads,
      enrolled: item.enrolled,
      conversionRate: item.conversion_rate,
    })),
    courseInterest: dto.course_interest.map((item) => ({
      course: item.course,
      label: item.label,
      count: item.count,
    })),
    branchComparison: dto.branch_comparison.map((item) => ({
      branchId: item.branch_id,
      branchName: item.branch_name,
      revenue: item.revenue,
      newEnrollments: item.new_enrollments,
      activeStudents: item.active_students,
      leads: item.leads,
      conversionRate: item.conversion_rate,
    })),
    delivery: {
      attendanceRate: dto.delivery.attendance_rate,
      attendancePresent: dto.delivery.attendance_present,
      attendanceTotal: dto.delivery.attendance_total,
      overtimeSessions: dto.delivery.overtime_sessions,
      unassignedTutorSessions: dto.delivery.unassigned_tutor_sessions,
      programDemand: dto.delivery.program_demand.map((item) => ({
        programId: item.program_id,
        title: item.title,
        sessions: item.sessions,
        enrollments: item.enrollments,
      })),
      tutorUtilization: dto.delivery.tutor_utilization.map((item) => ({
        tutorId: item.tutor_id,
        name: item.name,
        sessions: item.sessions,
        hours: item.hours,
      })),
      classroomUtilization: dto.delivery.classroom_utilization.map((item) => ({
        classroomId: item.classroom_id,
        name: item.name,
        sessions: item.sessions,
        bookedHours: item.booked_hours,
        utilizationRate: item.utilization_rate,
      })),
    },
  }
}

export async function fetchDashboardMetrics(
  filters: DashboardFilters,
): Promise<DashboardMetrics> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<DashboardMetricsDto>>(
    adminPath('/dashboard/metrics'),
    {
      params: {
        start: filters.startDate,
        end: filters.endDate,
        branch: isAllBranches(filters.branchId)
          ? undefined
          : Number(filters.branchId),
      },
    },
  )

  return mapDashboardMetrics(data.data)
}
