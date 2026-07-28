export type PredictionTestStatus = 'pending' | 'approved' | 'void'

export type PredictionTestListItem = {
  id: string
  studentName: string
  studentEmail: string
  studentPhone: string
  score: number | null
  description: string
  amount: number
  status: PredictionTestStatus
  educationCounsellor: string
  createdAt: string
  branch: string
}
