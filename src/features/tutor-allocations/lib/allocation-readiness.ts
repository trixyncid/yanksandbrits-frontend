import { courseForProgram, usesProgramLines } from './programs'
import { skillSessionSlots } from './session-layout'
import type { TutorAllocationListItem } from '../types/tutor-allocation'

export type AllocationSection = {
  label: string
  sessions: number
  hasTutor: boolean
}

export function allocationSections(
  allocation: TutorAllocationListItem,
): AllocationSection[] {
  if (usesProgramLines(allocation.program)) {
    return allocation.computerSciencePrograms.map((line) => ({
      label:
        [line.programCode, line.programTitle].filter(Boolean).join(' · ') ||
        'Program',
      sessions: line.sessions,
      hasTutor: Boolean(line.tutorId),
    }))
  }

  const course = courseForProgram(allocation.program)
  if (course === 'GEN') {
    return [
      {
        label: allocation.generalEnglishUnit1.trim() || 'Unit 1',
        sessions: allocation.generalEnglishUnit1Sessions,
        hasTutor: Boolean(allocation.generalEnglishUnit1TutorId),
      },
      {
        label: allocation.generalEnglishUnit2.trim() || 'Unit 2',
        sessions: allocation.generalEnglishUnit2Sessions,
        hasTutor: Boolean(allocation.generalEnglishUnit2TutorId),
      },
      {
        label: 'Grammar',
        sessions: allocation.generalEnglishGrammarSessions,
        hasTutor: Boolean(allocation.generalEnglishGrammarTutorId),
      },
    ]
  }

  return skillSessionSlots(course, allocation.program).map((slot) => ({
    label: slot.label,
    sessions: allocation[slot.sessionsKey],
    hasTutor: Boolean(allocation[slot.tutorKey]),
  }))
}

export function sectionsMissingTutors(allocation: TutorAllocationListItem) {
  return allocationSections(allocation)
    .filter((section) => section.sessions > 0 && !section.hasTutor)
    .map((section) => section.label)
}

export function allocationHasSessions(allocation: TutorAllocationListItem) {
  return allocationSections(allocation).some((section) => section.sessions > 0)
}
