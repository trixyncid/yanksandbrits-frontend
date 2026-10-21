import {
  isCombinedIeltsProgram,
  isComputerScienceCourse,
  isGeneralEnglishCourse,
  isHskCourse,
  isIeltsCourse,
  isSatCourse,
  isToeflCourse,
} from '../../../shared/api/choices'
import type { TutorAllocationFormValues } from '../types/tutor-allocation'

export type SkillSessionSlot = {
  label: string
  tutorKey: keyof Pick<
    TutorAllocationFormValues,
    | 'listeningTutorId'
    | 'readingTutorId'
    | 'writingTutorId'
    | 'speakingTutorId'
    | 'mathTutorId'
  >
  sessionsKey: keyof Pick<
    TutorAllocationFormValues,
    | 'listeningSessions'
    | 'readingSessions'
    | 'writingSessions'
    | 'speakingSessions'
    | 'mathSessions'
  >
  tutorNameKey:
    | 'listeningTutorName'
    | 'readingTutorName'
    | 'writingTutorName'
    | 'speakingTutorName'
    | 'mathTutorName'
  programKey: keyof Pick<
    TutorAllocationFormValues,
    | 'listeningProgramId'
    | 'readingProgramId'
    | 'writingProgramId'
    | 'speakingProgramId'
    | 'mathProgramId'
  >
  noteKey: keyof Pick<
    TutorAllocationFormValues,
    | 'listeningNote'
    | 'readingNote'
    | 'writingNote'
    | 'speakingNote'
    | 'mathNote'
  >
  programCodeKey:
    | 'listeningProgramCode'
    | 'readingProgramCode'
    | 'writingProgramCode'
    | 'speakingProgramCode'
    | 'mathProgramCode'
  programTitleKey:
    | 'listeningProgramTitle'
    | 'readingProgramTitle'
    | 'writingProgramTitle'
    | 'speakingProgramTitle'
    | 'mathProgramTitle'
}

const LISTENING: SkillSessionSlot = {
  label: 'Listening',
  tutorKey: 'listeningTutorId',
  sessionsKey: 'listeningSessions',
  tutorNameKey: 'listeningTutorName',
  programKey: 'listeningProgramId',
  noteKey: 'listeningNote',
  programCodeKey: 'listeningProgramCode',
  programTitleKey: 'listeningProgramTitle',
}
const READING: SkillSessionSlot = {
  label: 'Reading',
  tutorKey: 'readingTutorId',
  sessionsKey: 'readingSessions',
  tutorNameKey: 'readingTutorName',
  programKey: 'readingProgramId',
  noteKey: 'readingNote',
  programCodeKey: 'readingProgramCode',
  programTitleKey: 'readingProgramTitle',
}
const WRITING: SkillSessionSlot = {
  label: 'Writing',
  tutorKey: 'writingTutorId',
  sessionsKey: 'writingSessions',
  tutorNameKey: 'writingTutorName',
  programKey: 'writingProgramId',
  noteKey: 'writingNote',
  programCodeKey: 'writingProgramCode',
  programTitleKey: 'writingProgramTitle',
}
const SPEAKING: SkillSessionSlot = {
  label: 'Speaking',
  tutorKey: 'speakingTutorId',
  sessionsKey: 'speakingSessions',
  tutorNameKey: 'speakingTutorName',
  programKey: 'speakingProgramId',
  noteKey: 'speakingNote',
  programCodeKey: 'speakingProgramCode',
  programTitleKey: 'speakingProgramTitle',
}

export function skillSessionSlots(
  course: string | null | undefined,
  program: string | null | undefined,
): SkillSessionSlot[] {
  if (!course || isGeneralEnglishCourse(course) || isComputerScienceCourse(course)) {
    return []
  }
  if (isSatCourse(course)) {
    return [
      {
        label: 'Reading & Writing',
        tutorKey: 'readingTutorId',
        sessionsKey: 'readingSessions',
        tutorNameKey: 'readingTutorName',
        programKey: 'readingProgramId',
        noteKey: 'readingNote',
        programCodeKey: 'readingProgramCode',
        programTitleKey: 'readingProgramTitle',
      },
      {
        label: 'Mathematics',
        tutorKey: 'mathTutorId',
        sessionsKey: 'mathSessions',
        tutorNameKey: 'mathTutorName',
        programKey: 'mathProgramId',
        noteKey: 'mathNote',
        programCodeKey: 'mathProgramCode',
        programTitleKey: 'mathProgramTitle',
      },
    ]
  }
  if (isToeflCourse(course)) {
    return [LISTENING, WRITING, READING]
  }
  if (isIeltsCourse(course) && isCombinedIeltsProgram(program)) {
    return [
      {
        label: 'Listening & Speaking',
        tutorKey: 'listeningTutorId',
        sessionsKey: 'listeningSessions',
        tutorNameKey: 'listeningTutorName',
        programKey: 'listeningProgramId',
        noteKey: 'listeningNote',
        programCodeKey: 'listeningProgramCode',
        programTitleKey: 'listeningProgramTitle',
      },
      {
        label: 'Reading & Writing',
        tutorKey: 'readingTutorId',
        sessionsKey: 'readingSessions',
        tutorNameKey: 'readingTutorName',
        programKey: 'readingProgramId',
        noteKey: 'readingNote',
        programCodeKey: 'readingProgramCode',
        programTitleKey: 'readingProgramTitle',
      },
    ]
  }
  if (isIeltsCourse(course)) {
    // IELTS B: one section per skill, in exam order.
    return [LISTENING, READING, WRITING, SPEAKING]
  }
  if (isHskCourse(course)) {
    return [LISTENING, WRITING, READING, SPEAKING]
  }
  return [LISTENING, WRITING, READING, SPEAKING]
}
