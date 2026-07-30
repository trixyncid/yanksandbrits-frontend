export type ClassroomListItem = {
  id: string
  code: string
  className: string
  isActive: boolean
  branchId: string | null
  branchName: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export type ClassroomFormValues = {
  code: string
  className: string
  isActive: boolean
  branchId: string
}

export type ClassroomFormErrors = Partial<
  Record<keyof ClassroomFormValues, string>
>

export type ClassroomBranchOption = {
  id: string
  name: string
}
