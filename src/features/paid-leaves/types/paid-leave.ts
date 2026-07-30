export type PaidLeaveStatus = 'pending' | 'approved' | 'void'

export type PaidLeaveListItem = {
  id: string
  userId: string
  staffPin: string
  staffName: string
  staffEmail: string
  branch: string
  branchId: string | null
  startDate: string
  endDate: string
  totalDays: number
  notes: string
  status: PaidLeaveStatus
  createdAt: string
  hasFile: boolean
  fileUrl: string | null
}

export type PaidLeaveFormValues = {
  userId: string
  startDate: string
  endDate: string
  notes: string
  status: PaidLeaveStatus
  filesFile: File | null
}

export type PaidLeaveFormErrors = Partial<
  Record<keyof PaidLeaveFormValues, string>
>
