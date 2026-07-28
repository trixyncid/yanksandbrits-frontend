export type StudentGender = 'M' | 'F'
export type StudentStatus = 'active' | 'inactive'

export type StudentListItem = {
  id: string
  pin: string
  fullName: string
  email: string
  mobilePhone: string
  gender: StudentGender
  enrollmentDate: string
  counsellor: string
  branch: string
  status: StudentStatus
}
