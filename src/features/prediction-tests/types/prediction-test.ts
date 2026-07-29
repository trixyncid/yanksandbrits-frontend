export type PredictionTestStatus = 'pending' | 'approved' | 'void'

export type PredictionTestListItem = {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  score: number | null
  description: string
  amount: number
  status: PredictionTestStatus
  educationCounsellor: string
  hasPaymentProof: boolean
  createdAt: string
  updatedAt: string
  branch: string
}

export type PredictionTestFormValues = {
  studentId: string
  score: string
  description: string
  amount: string
  status: PredictionTestStatus
  hasPaymentProof: boolean
}

export type PredictionTestFormErrors = Partial<
  Record<keyof PredictionTestFormValues, string>
>
