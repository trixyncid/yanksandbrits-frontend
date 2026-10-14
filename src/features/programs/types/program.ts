import type { StaffTypeCode } from '../../users/api/users-api'

/** Empty when the program has no subject yet. */
export type ProgramSubject = StaffTypeCode | ''

export type ProgramListItem = {
  id: string
  code: string
  title: string
  description: string
  subject: ProgramSubject
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
  isActive: boolean
  backgroundColor: string
  textColor: string
}

export type ProgramFormErrors = Partial<
  Record<keyof ProgramFormValues, string>
>
