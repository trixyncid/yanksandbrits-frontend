export type StudentGender = 'M' | 'F'
export type StudentStatus = 'active' | 'inactive'
export type StudentPaymentStatus = 'paid' | 'pending'
export type StudentProgramStatus = 'ongoing' | 'completed' | 'pending'

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

export type StudentProgramItem = {
  id: string
  code: string
  title: string
  description: string
  period: string
  sessions: number
  sessionsUsed: number
  firstMeeting: string
  lastMeeting: string
  progress: number
  status: StudentProgramStatus
}

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
  occupation: string
  institution: string
  enrollmentDate: string
  status: StudentStatus
  paymentStatus: StudentPaymentStatus
  counsellor: string
  referral: string
  grn: string
  branch: string
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
  occupation: string
  institution: string
  enrollmentDate: string
  counsellor: string
  referral: string
  grn: string
  branch: string
  status: StudentStatus
}

export type StudentFormErrors = Partial<
  Record<keyof StudentFormValues, string>
>
