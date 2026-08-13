export type BookkeepingStatus = 'pending' | 'approved' | 'void'

export type BookkeepingListItem = {
  id: string
  startDate: string
  endDate: string
  status: BookkeepingStatus
  title: string
  branchId: string | null
  branchName: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export type BookkeepingDetail = BookkeepingListItem

export type BookkeepingFormValues = {
  startDate: string
  endDate: string
  title: string
  status: BookkeepingStatus
  branchId: string
}

export type BookkeepingFormErrors = Partial<
  Record<keyof BookkeepingFormValues, string>
>

export type BookkeepingTutorSalaryItem = {
  id: string
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
}

export type BookkeepingMarketingSalaryItem = {
  id: string
  marketerPin: string
  marketerName: string
  email: string
  totalStudent: number
  mainSalary: number
  bonusSalary: number
  totalSalary: number
}
