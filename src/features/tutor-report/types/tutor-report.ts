export type TutorReportListItem = {
  id: string
  tutorId: string | null
  tutorPin: string
  tutorName: string
  tutorEmail: string
  workingDays: number
  mainSalary: number
  sessions: number
  sessionSalary: number
  overtimeSessions: number
  overtimeSalary: number
  totalSalary: number
  /** Stored calculation vs live open-period preview */
  source: 'bookkeeping' | 'open'
}
