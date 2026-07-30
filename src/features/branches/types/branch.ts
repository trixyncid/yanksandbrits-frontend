export type BranchListItem = {
  id: string
  name: string
  brandId: string | null
  brandName: string | null
  phone: string
  address: string
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
  brandId: string
}

export type BranchFormErrors = Partial<Record<keyof BranchFormValues, string>>

export type BrandOption = {
  id: string
  name: string
}
