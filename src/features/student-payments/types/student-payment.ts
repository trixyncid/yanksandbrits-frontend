export type StudentPaymentStatus = 'pending' | 'approved' | 'void'

export type StudentPaymentListItem = {
  id: string
  studentId: string
  studentPin: string
  studentName: string
  title: string
  description: string
  amount: number
  transactionDate: string
  status: StudentPaymentStatus
  createdBy: string
  hasPaymentProof: boolean
  paymentProofUrl: string | null
  branch: string
}

export type StudentPaymentFormValues = {
  studentId: string
  title: string
  description: string
  amount: string
  status: StudentPaymentStatus
  hasPaymentProof: boolean
}

export type StudentPaymentFormErrors = Partial<
  Record<keyof StudentPaymentFormValues, string>
>
