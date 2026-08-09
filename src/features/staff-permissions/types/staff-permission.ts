export type StaffPermissionListItem = {
  id: string
  name: string
  code: string
  isSystem: boolean
  description: string
  permissionCount: number
  memberCount: number
}

export type StaffPermissionDetail = {
  id: string
  name: string
  code: string
  isSystem: boolean
  description: string
  permissionIds: string[]
  permissionCount: number
  memberCount: number
}

export type PermissionOption = {
  id: string
  codename: string
  name: string
  appLabel: string
  model: string
}

export type StaffPermissionFormValues = {
  name: string
  code: string
  description: string
  permissionIds: string[]
}

export type StaffPermissionFormErrors = Partial<
  Record<keyof StaffPermissionFormValues, string>
>
