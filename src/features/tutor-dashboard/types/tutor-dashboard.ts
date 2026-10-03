export type TutorPeriodOption = {
  id: string
  title: string
  startDate: string
  endDate: string
  status: string
}

export type TutorPeriodInfo = {
  label: string
  start: string
  end: string
  isOpenPeriod: boolean
  periodType: string
  bookkeepingId: number | null
}

export type TutorKpiValue = {
  current: number
  previous: number
  changePct: number | null
}

export type TutorBonusProgress = {
  sessionCount: number
  currentTierMin: number | null
  currentTierMax: number | null
  nextTierMin: number | null
  remaining: number
  progressPct: number
  bonusAmount: number
}

export type TutorWorkload = {
  workingDays: number
  overtimeSessions: number
  regularSessions: number
  sessionsPerDay: number
  cancelledSessions: number
}

export type TutorProgramMixItem = {
  programId: number | null
  title: string
  sessions: number
  hours: number
}

export type TutorWeeklyTrendItem = {
  weekStart: string
  label: string
  sessions: number
  hours: number
}

export type TutorCancellationItem = {
  id: number
  date: string
  startTime: string
  program: string
  subject: string
  subjectType: string
}

export type TutorEarnings = {
  tutorId: number | null
  tutorName: string | null
  tutorPin: string | null
  workingDays: number
  mainSalary: number
  numberSessions: number
  sessionSalary: number
  overtimeSessions: number
  overtimeSalary: number
  bonusSalary: number
  expectedSalary: number
}

export type TutorPerformanceMetrics = {
  period: TutorPeriodInfo
  defaultPeriod: string
  comparisonPeriod: {
    label: string
    start: string
    end: string
  }
  availablePeriods: TutorPeriodOption[]
  kpis: {
    expectedPay: TutorKpiValue
    finishedSessions: TutorKpiValue
    hoursTaught: TutorKpiValue
    cancellationRate: TutorKpiValue
    studentAttendanceRate: TutorKpiValue
    bonusProgress: TutorBonusProgress
  }
  workload: TutorWorkload
  programMix: TutorProgramMixItem[]
  weeklyTrend: TutorWeeklyTrendItem[]
  cancellations: TutorCancellationItem[]
  earnings: TutorEarnings
  earningsMeta: {
    period: string
    isOpenPeriod: boolean
    startDate: string
    endDate: string
  }
}
