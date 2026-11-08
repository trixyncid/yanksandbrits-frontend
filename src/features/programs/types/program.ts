import type { StaffTypeCode } from '../../users/api/users-api'

/** Empty when the program has no subject yet. */
export type ProgramSubject = StaffTypeCode | ''

/** Who the program is for (stored as `audience`). */
export type ProgramAudience = 'student' | 'tutor' | 'both'

export const PROGRAM_AUDIENCE_OPTIONS: { value: ProgramAudience; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'both', label: 'Both' },
]

export function programAudienceLabel(audience: ProgramAudience) {
  return PROGRAM_AUDIENCE_OPTIONS.find((option) => option.value === audience)?.label ?? 'Student'
}

export type ProgramListItem = {
  id: string
  code: string
  title: string
  description: string
  subject: ProgramSubject
  audience: ProgramAudience
  isActive: boolean
  backgroundColor: string
  textColor: string
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export type ProgramFormValues = {
  code: string
  title: string
  description: string
  subject: ProgramSubject
  audience: ProgramAudience
  isActive: boolean
  backgroundColor: string
  textColor: string
}

export type ProgramFormErrors = Partial<
  Record<keyof ProgramFormValues, string>
>
