import type { ScheduleAvailability } from '../../prediction-tests/lib/schedule'
import type { TutorAllocationProgram } from '../lib/programs'

export type TutorAllocationClassType = 'private' | 'group'
export type TutorAllocationGroupSize = '2' | '3' | '4'

export type ComputerScienceProgramLine = {
  programId: string
  sessions: string
  tutorId: string
  note: string
}

export type ComputerScienceProgramAssignment = {
  position: number
  programId: string
  programCode: string
  programTitle: string
  /** Catalog program subject, e.g. Accounting. Empty when not set. */
  programSubject: string
  sessions: number
  tutorId: string
  tutorName: string
  note: string
}

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
  listeningProgramId: string
  readingProgramId: string
  writingProgramId: string
  speakingProgramId: string
  mathProgramId: string
  listeningProgramCode: string
  readingProgramCode: string
  writingProgramCode: string
  speakingProgramCode: string
  mathProgramCode: string
  listeningProgramTitle: string
  readingProgramTitle: string
  writingProgramTitle: string
  speakingProgramTitle: string
  mathProgramTitle: string
  listeningNote: string
  readingNote: string
  writingNote: string
  speakingNote: string
  mathNote: string
  listeningSessions: number
  readingSessions: number
  writingSessions: number
  speakingSessions: number
  mathSessions: number
  generalEnglishUnit1: string
  generalEnglishUnit1Sessions: number
  generalEnglishUnit1TutorId: string
  generalEnglishUnit1TutorName: string
  generalEnglishUnit1ProgramId: string
  generalEnglishUnit1ProgramCode: string
  generalEnglishUnit1ProgramTitle: string
  generalEnglishUnit1Note: string
  generalEnglishUnit2: string
  generalEnglishUnit2Sessions: number
  generalEnglishUnit2TutorId: string
  generalEnglishUnit2TutorName: string
  generalEnglishUnit2ProgramId: string
  generalEnglishUnit2ProgramCode: string
  generalEnglishUnit2ProgramTitle: string
  generalEnglishUnit2Note: string
  generalEnglishGrammarSessions: number
  generalEnglishGrammarTutorId: string
  generalEnglishGrammarTutorName: string
  generalEnglishGrammarProgramId: string
  generalEnglishGrammarProgramCode: string
  generalEnglishGrammarProgramTitle: string
  generalEnglishGrammarNote: string
  computerSciencePrograms: ComputerScienceProgramAssignment[]
  /** Subjects the class teaches (English, Mandarin, IT, Accounting). */
  subjects: string[]
  approved: boolean
  approvedAt: string
  approvedBy: string
  tutorsAllocated: boolean
  tutorsAllocatedAt: string
  tutorsAllocatedBy: string
  programsAssigned: boolean
  programsAssignedAt: string
  programsAssignedBy: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export type EligibleAllocationStudent = {
  id: string
  pin: string
  fullName: string
  mobilePhone: string
  grn: string
  prospectiveStudentId: string | null
  predictionTestId: string | null
  course: string | null
  listening: string | null
  reading: string | null
  writing: string | null
  speaking: string | null
  math: string | null
  writtenTestScore: string | null
}

export type TutorAllocationFormValues = {
  classType: TutorAllocationClassType
  groupSize: TutorAllocationGroupSize
  program: TutorAllocationProgram | ''
  studentIds: [string, string, string, string]
  sessionsPerWeek: '' | '1' | '2' | '3' | '4_6'
  availability: ScheduleAvailability
  scheduleNote: string
  listeningTutorId: string
  readingTutorId: string
  writingTutorId: string
  speakingTutorId: string
  mathTutorId: string
  listeningProgramId: string
  readingProgramId: string
  writingProgramId: string
  speakingProgramId: string
  mathProgramId: string
  listeningNote: string
  readingNote: string
  writingNote: string
  speakingNote: string
  mathNote: string
  listeningSessions: string
  readingSessions: string
  writingSessions: string
  speakingSessions: string
  mathSessions: string
  generalEnglishUnit1: string
  generalEnglishUnit1Sessions: string
  generalEnglishUnit1TutorId: string
  generalEnglishUnit1ProgramId: string
  generalEnglishUnit1Note: string
  generalEnglishUnit2: string
  generalEnglishUnit2Sessions: string
  generalEnglishUnit2TutorId: string
  generalEnglishUnit2ProgramId: string
  generalEnglishUnit2Note: string
  generalEnglishGrammarSessions: string
  generalEnglishGrammarTutorId: string
  generalEnglishGrammarProgramId: string
  generalEnglishGrammarNote: string
  computerSciencePrograms: ComputerScienceProgramLine[]
}

export type TutorAllocationFormErrors = Partial<
  Record<keyof TutorAllocationFormValues, string>
>
