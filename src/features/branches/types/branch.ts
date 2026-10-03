export type BranchListItem = {
  id: string
  name: string
  phone: string
  address: string
  isMain: boolean
  totalStudent: number
  createdAt: string
  updatedAt: string
  createdBy: string | null
  updatedBy: string | null
}

export type BranchFormValues = {
  name: string
  phone: string
  address: string
  isMain: boolean
}

export type BranchFormErrors = Partial<Record<keyof BranchFormValues, string>>
