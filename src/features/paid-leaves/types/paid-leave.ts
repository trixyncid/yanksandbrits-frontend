export type PaidLeaveStatus = 'pending' | 'approved' | 'void'

export type PaidLeaveListItem = {
  id: string
  staffPin: string
  staffName: string
  staffEmail: string
  branch: string
  startDate: string
  endDate: string
  totalDays: number
  notes: string
  status: PaidLeaveStatus
  createdAt: string
  hasFile: boolean
}
