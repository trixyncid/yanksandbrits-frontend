export type MarketingReportListItem = {
  id: string
  marketerId: string | null
  marketerPin: string
  marketerName: string
  email: string
  totalStudent: number
  mainSalary: number
  bonusSalary: number
  totalSalary: number
  branch: string
  /** Stored calculation vs live open-period preview */
  source: 'bookkeeping' | 'open'
}
