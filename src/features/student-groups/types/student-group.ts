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
