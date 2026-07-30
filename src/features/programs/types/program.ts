export type ProgramListItem = {
  id: string
  code: string
  title: string
  description: string
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
  isActive: boolean
  backgroundColor: string
  textColor: string
}

export type ProgramFormErrors = Partial<
  Record<keyof ProgramFormValues, string>
>
