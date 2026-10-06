import type { GeneralEnglishSpeakingChecks } from '../lib/general-english-speaking'
import type { GeneralEnglishWritingChecks } from '../lib/general-english-writing'

export type PredictionTestStatus = 'pending' | 'approved' | 'void'

export type PredictionTestAttachment = {
  id: string
  fileKey: string
  fileSize: number
  fileUrl: string
  createdAt: string
}

export type PredictionTestListItem = {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  studentSrNumber: string
  studentCourse: string | null
  listening: number | null
  reading: number | null
  writing: number | null
  speaking: number | null
  math: number | null
  writtenTestScore: number | null
  generalEnglishTutorId: string | null
  generalEnglishTutorName: string
  generalEnglishSpeaking: GeneralEnglishSpeakingChecks
  generalEnglishWriting: GeneralEnglishWritingChecks
  description: string
  amount: number
  status: PredictionTestStatus
  educationCounsellor: string
  attachments: PredictionTestAttachment[]
  hasPaymentProof: boolean
  paymentProofUrl: string
  createdAt: string
  updatedAt: string
  branchId: string | null
  branch: string
}

export type PredictionTestFormValues = {
  studentId: string
  branchId: string
  listening: string
  reading: string
  writing: string
  speaking: string
  math: string
  writtenTestScore: string
  generalEnglishTutorId: string
  generalEnglishSpeaking: GeneralEnglishSpeakingChecks
  generalEnglishWriting: GeneralEnglishWritingChecks
  description: string
  amount: string
  status: PredictionTestStatus
  paymentProofFiles: File[]
}

export type PredictionTestFormErrors = Partial<
  Record<keyof PredictionTestFormValues, string>
>
