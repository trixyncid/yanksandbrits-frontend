export type ClassroomListItem = {
  id: string
  code: string
  className: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  branch: string
}

export type ClassroomFormValues = {
  code: string
  className: string
  isActive: boolean
  branch: string
}

export type ClassroomFormErrors = Partial<
  Record<keyof ClassroomFormValues, string>
>
