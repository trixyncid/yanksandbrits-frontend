import { format, startOfDay, subMonths } from 'date-fns'
import type { DateRange } from 'react-day-picker'

export type DashboardLeadSource = {
  source: string
  label: string
  leads: number
  enrolled: number
  conversionRate: number
}

export type DashboardMarketingAttribution = {
  marketingId: number | null
  name: string
  leads: number
  enrolled: number
  conversionRate: number
}

export type DashboardCourseInterest = {
  course: string
  label: string
  count: number
}

export type DashboardBranchComparison = {
  branchId: number
  branchName: string
  revenue: number
  newEnrollments: number
  activeStudents: number
  leads: number
  conversionRate: number | null
}

export type DashboardProgramDemand = {
  programId: number | null
  title: string
  sessions: number
  enrollments: number
}

export type DashboardTutorUtilization = {
  tutorId: number | null
  name: string
  sessions: number
  hours: number
}

export type DashboardClassroomUtilization = {
  classroomId: number | null
  name: string
  sessions: number
  bookedHours: number
  utilizationRate: number
}

export type DashboardDelivery = {
  attendanceRate: number | null
  attendancePresent: number
  attendanceTotal: number
  overtimeSessions: number
  unassignedTutorSessions: number
  programDemand: DashboardProgramDemand[]
  tutorUtilization: DashboardTutorUtilization[]
  classroomUtilization: DashboardClassroomUtilization[]
}

export type DashboardMetrics = {
  dateRange: { start: string; end: string }
  comparisonRange: { start: string; end: string }
  branchId: number | null
  kpis: {
    revenue: {
      current: number
      previous: number
      changePct: number | null
      studentPayments: number
      predictionTests: number
    }
    newEnrollments: {
      current: number
      previous: number
      changePct: number | null
    }
    activeStudents: number
    conversionRate: number | null
    pendingCollections: {
      amount: number
      count: number
    }
  }
  operations: {
    sessionsTotal: number
    sessionsFinished: number
    sessionsCancelled: number
    cancellationRate: number
  }
  prospectFunnel: {
    status: string
    label: string
    count: number
  }[]
  trends: {
    revenue: { month: string; revenue: number }[]
    enrollments: { month: string; enrollments: number }[]
  }
  actions: {
    pendingPayments: number
    pendingLeave: number
    staleProspects: number
  }
  leadSources: DashboardLeadSource[]
  marketingAttribution: DashboardMarketingAttribution[]
  courseInterest: DashboardCourseInterest[]
  branchComparison: DashboardBranchComparison[]
  delivery: DashboardDelivery
}

export type DashboardFilters = {
  startDate: string
  endDate: string
  branchId: string
}

export const ALL_BRANCHES_ID = 'all'

export function getDefaultDashboardDateRange(): DateRange {
  const today = startOfDay(new Date())
  return {
    from: subMonths(today, 1),
    to: today,
  }
}

export function formatDashboardDateRange(range: DateRange | undefined) {
  if (!range?.from || !range.to) {
    return null
  }

  return {
    startDate: formatDateKey(range.from),
    endDate: formatDateKey(range.to),
  }
}

export function formatDateKey(value: Date) {
  return format(value, 'yyyy-MM-dd')
}

export function isAllBranches(branchId: string) {
  return branchId === ALL_BRANCHES_ID
}
