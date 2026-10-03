export type StudentPaymentTermStatus = 'pending' | 'approved' | 'void'
export type StudentPaymentPlanStatus = 'incomplete' | 'complete'

export type StudentPaymentTermAttachment = {
  id: string
  fileKey: string
  fileUrl: string
}

export type StudentPaymentTerm = {
  id: string
  amount: number
  status: StudentPaymentTermStatus
  description: string
  paymentDate: string
  createdAt: string
  createdBy: string
  branchId: string | null
  branch: string
  attachments: StudentPaymentTermAttachment[]
}

export type StudentPaymentListItem = {
  id: string
  studentId: string | null
  prospectiveStudentId: string | null
  studentPin: string
  studentName: string
  title: string
  fullAmount: number
  paidAmount: number
  status: StudentPaymentPlanStatus
  terms: StudentPaymentTerm[]
  createdAt: string
  createdBy: string
  /** Derived from installment branches for list/detail display. */
  branchId: string | null
  branch: string
  /** Approved pretest amount claimed by this plan for commission (once per person). */
  linkedPredictionTestAmount: number
  linkedPredictionTests: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
  }>
  /** Planned amount + foldable pretest for this plan only. */
  commissionBaseAmount: number
  /** True when this completed plan folds pretest into commission payout. */
  predictionFoldedIntoCommission: boolean
  /** True when matched pretest exists but another plan owns the claim. */
  predictionClaimedElsewhere: boolean
}

export type StudentPaymentTermFormValues = {
  key: string
  id?: string
  amount: string
  status: StudentPaymentTermStatus
  description: string
  paymentDate: string
  branchId: string
  /** Client-only staged proofs; uploaded on Apply (saved terms) or after plan save. */
  proofFiles?: File[]
}

export type StudentPaymentFormValues = {
  studentId: string
  prospectiveStudentId: string
  title: string
  fullAmount: string
  terms: StudentPaymentTermFormValues[]
}

export type StudentPaymentTermFieldErrors = Partial<
  Record<'amount' | 'status' | 'description' | 'paymentDate' | 'branchId', string>
>

export type StudentPaymentFormErrors = {
  studentId?: string
  prospectiveStudentId?: string
  title?: string
  fullAmount?: string
  terms?: string
  termErrors?: Record<string, StudentPaymentTermFieldErrors>
}
