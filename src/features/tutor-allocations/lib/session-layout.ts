import {
  isCombinedIeltsProgram,
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
}

const LISTENING: SkillSessionSlot = {
  label: 'Listening',
  tutorKey: 'listeningTutorId',
  sessionsKey: 'listeningSessions',
  tutorNameKey: 'listeningTutorName',
}
const READING: SkillSessionSlot = {
  label: 'Reading',
  tutorKey: 'readingTutorId',
  sessionsKey: 'readingSessions',
  tutorNameKey: 'readingTutorName',
}
const WRITING: SkillSessionSlot = {
  label: 'Writing',
  tutorKey: 'writingTutorId',
  sessionsKey: 'writingSessions',
  tutorNameKey: 'writingTutorName',
}
const SPEAKING: SkillSessionSlot = {
  label: 'Speaking',
  tutorKey: 'speakingTutorId',
  sessionsKey: 'speakingSessions',
  tutorNameKey: 'speakingTutorName',
}

export function skillSessionSlots(
  course: string | null | undefined,
  program: string | null | undefined,
): SkillSessionSlot[] {
  if (!course || isGeneralEnglishCourse(course)) {
    return []
  }
  if (isSatCourse(course)) {
    return [
      {
        label: 'Reading & Writing',
        tutorKey: 'readingTutorId',
        sessionsKey: 'readingSessions',
        tutorNameKey: 'readingTutorName',
      },
      {
        label: 'Mathematics',
        tutorKey: 'mathTutorId',
        sessionsKey: 'mathSessions',
        tutorNameKey: 'mathTutorName',
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
      },
      {
        label: 'Reading & Writing',
        tutorKey: 'readingTutorId',
        sessionsKey: 'readingSessions',
        tutorNameKey: 'readingTutorName',
      },
    ]
  }
  if (isIeltsCourse(course) || isHskCourse(course)) {
    return [LISTENING, WRITING, READING, SPEAKING]
  }
  return [LISTENING, WRITING, READING, SPEAKING]
}
