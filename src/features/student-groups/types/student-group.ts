export type StudentGroupStatus = 'active' | 'inactive'

export type StudentGroupMember = {
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
  memberPins: string[]
  status: StudentGroupStatus
}

export type StudentGroupFormErrors = Partial<
  Record<'groupName' | 'memberPins' | 'status', string>
>

export type StudentGroupMemberOption = {
  pin: string
  fullName: string
  branch: string
}
