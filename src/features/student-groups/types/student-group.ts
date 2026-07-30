export type StudentGroupStatus = 'active' | 'inactive'

export type StudentGroupMember = {
  id: string
  pin: string
  fullName: string
}

export type StudentGroupListItem = {
  id: string
  groupName: string
  members: StudentGroupMember[]
  status: StudentGroupStatus
  createdAt: string
  updatedAt: string
  createdBy: string
  branch: string
}

export type StudentGroupFormValues = {
  groupName: string
  memberIds: string[]
  status: StudentGroupStatus
}

export type StudentGroupFormErrors = Partial<
  Record<'groupName' | 'memberIds' | 'status', string>
>

export type StudentGroupMemberOption = {
  id: string
  pin: string
  fullName: string
  branch: string
}
