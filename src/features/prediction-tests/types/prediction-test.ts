import type { PredictionProgramCode } from '../../../shared/api/choices'

export type PredictionTestStatus = 'pending' | 'approved' | 'void'

export type AcademicLeaderDecision = 'approve' | 'reject'

export type AcademicLeaderStatus = 'pending_review' | 'reviewed'

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
  ieltsProgram: PredictionProgramCode | null
  managerApproved: boolean
  academicLeaderDecision: AcademicLeaderDecision | null
  academicLeaderRemarks: string
  academicLeaderStatus: AcademicLeaderStatus
  effectiveIeltsProgram: PredictionProgramCode | null
  listening: number | null
  reading: number | null
  writing: number | null
  speaking: number | null
  math: number | null
  listeningTutorId: string | null
  readingTutorId: string | null
  writingTutorId: string | null
  speakingTutorId: string | null
  mathTutorId: string | null
  listeningTutorName: string
  readingTutorName: string
  writingTutorName: string
  speakingTutorName: string
  mathTutorName: string
  listeningSessions: number
  readingSessions: number
  writingSessions: number
  speakingSessions: number
  mathSessions: number
  scheduleMorning: boolean
  scheduleAfternoon: boolean
  scheduleEvening: boolean
  scheduleNote: string
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
  ieltsProgram: PredictionProgramCode | ''
  managerApproved: boolean
  academicLeaderDecision: AcademicLeaderDecision | ''
  academicLeaderRemarks: string
  listening: string
  reading: string
  writing: string
  speaking: string
  math: string
  listeningTutorId: string
  readingTutorId: string
  writingTutorId: string
  speakingTutorId: string
  mathTutorId: string
  listeningSessions: string
  readingSessions: string
  writingSessions: string
  speakingSessions: string
  mathSessions: string
  scheduleMorning: boolean
  scheduleAfternoon: boolean
  scheduleEvening: boolean
  scheduleNote: string
  description: string
  amount: string
  status: PredictionTestStatus
  paymentProofFiles: File[]
}

export type PredictionTestFormErrors = Partial<
  Record<keyof PredictionTestFormValues, string>
>
