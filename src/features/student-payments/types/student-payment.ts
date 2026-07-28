export type StudentPaymentStatus = 'pending' | 'approved' | 'void'

export type StudentPaymentListItem = {
  id: string
  studentPin: string
  studentName: string
  title: string
  description: string
  amount: number
  transactionDate: string
  status: StudentPaymentStatus
  createdBy: string
  hasPaymentProof: boolean
  branch: string
}
