import type { ScheduleAvailability } from '../../prediction-tests/lib/schedule'
import type { TutorAllocationProgram } from '../lib/programs'

export type TutorAllocationClassType = 'private' | 'group'
export type TutorAllocationGroupSize = '2' | '3'

export type TutorAllocationScore = {
  studentId: string
  position: number
  studentName: string
  pin: string
  grn: string
  course: string | null
  predictionTestId: string | null
  listening: string | null
  reading: string | null
  writing: string | null
  speaking: string | null
  math: string | null
  writtenTestScore: string | null
}

export type TutorAllocationListItem = {
  id: string
  classType: TutorAllocationClassType
  groupSize: number
  branchId: string | null
  branchName: string
  program: TutorAllocationProgram | ''
  course: string | null
  members: TutorAllocationScore[]
  sessionsPerWeek: string
  availability: ScheduleAvailability
  scheduleNote: string
  listeningTutorId: string
  readingTutorId: string
  writingTutorId: string
  speakingTutorId: string
  mathTutorId: string
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
  generalEnglishUnit1: string
  generalEnglishUnit1Sessions: number
  generalEnglishUnit1TutorId: string
  generalEnglishUnit1TutorName: string
  generalEnglishUnit2: string
  generalEnglishUnit2Sessions: number
  generalEnglishUnit2TutorId: string
  generalEnglishUnit2TutorName: string
  generalEnglishGrammarSessions: number
  generalEnglishGrammarTutorId: string
  generalEnglishGrammarTutorName: string
  approved: boolean
  approvedAt: string
  approvedBy: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export type TutorAllocationFormValues = {
  classType: TutorAllocationClassType
  groupSize: TutorAllocationGroupSize
  program: TutorAllocationProgram | ''
  studentIds: [string, string, string]
  sessionsPerWeek: '' | '1' | '2' | '3' | '4_6'
  availability: ScheduleAvailability
  scheduleNote: string
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
  generalEnglishUnit1: string
  generalEnglishUnit1Sessions: string
  generalEnglishUnit1TutorId: string
  generalEnglishUnit2: string
  generalEnglishUnit2Sessions: string
  generalEnglishUnit2TutorId: string
  generalEnglishGrammarSessions: string
  generalEnglishGrammarTutorId: string
}

export type TutorAllocationFormErrors = Partial<
  Record<keyof TutorAllocationFormValues, string>
>
