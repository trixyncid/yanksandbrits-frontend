export type BookkeepingStatus = 'pending' | 'approved' | 'void'

export type BookkeepingListItem = {
  id: string
  startDate: string
  endDate: string
  status: BookkeepingStatus
  createdAt: string
  updatedAt: string
  createdBy: string
}
