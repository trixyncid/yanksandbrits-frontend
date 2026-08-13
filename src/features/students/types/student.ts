export type StudentGender = 'M' | 'F'
export type StudentStatus = 'active' | 'inactive'
export type StudentProgramStatus = 'ongoing' | 'completed'

export type StudentListItem = {
  id: string
  pin: string
  fullName: string
  email: string
  mobilePhone: string
  gender: StudentGender
  enrollmentDate: string
  counsellor: string
  counsellorId: string | null
  branch: string
  branchId: string | null
  status: StudentStatus
  hasAccount: boolean
}

export type StudentProgramItem = {
  id: string
  studentId: string
  programId: string
  code: string
  title: string
  description: string
  period: number
  sessions: number
  sessionsUsed: number
  progressPercentage: number
  isFinished: boolean
  status: StudentProgramStatus
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export type StudentProgramFormValues = {
  programId: string
  description: string
  period: string
  sessions: string
  status: StudentProgramStatus
}

export type StudentProgramFormErrors = Partial<
  Record<keyof StudentProgramFormValues, string>
>

export type StudentDetail = {
  id: string
  pin: string
  fullName: string
  email: string
  gender: StudentGender
  birthPlace: string
  birthDate: string
  address: string
  mobilePhone: string
  homePhone: string
  othersPhone: string
  occupationId: string | null
  occupationName: string
  institutionId: string | null
  institutionName: string
  country: string
  university: string
  major: string
  enrollmentDate: string
  status: StudentStatus
  counsellorId: string | null
  counsellor: string
  referralMarketing: string
  grn: string
  branchId: string | null
  branch: string
  hasAccount: boolean
  accountActive: boolean | null
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  programs: StudentProgramItem[]
}

export type StudentFormValues = {
  pin: string
  fullName: string
  email: string
  gender: StudentGender
  birthPlace: string
  birthDate: string
  address: string
  mobilePhone: string
  homePhone: string
  othersPhone: string
  occupationId: string
  institutionId: string
  country: string
  university: string
  major: string
  enrollmentDate: string
  counsellorId: string
  referralMarketing: string
  grn: string
  branchId: string
  status: StudentStatus
}

export type StudentFormErrors = Partial<
  Record<keyof StudentFormValues, string>
>
