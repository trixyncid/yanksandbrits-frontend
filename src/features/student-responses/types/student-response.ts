export type StudentResponseStatus = 'pending' | 'approved' | 'void'

export type StudentResponseListItem = {
  id: string
  studentId: string
  studentPin: string
  studentName: string
  studentEmail: string
  studentPhone: string
  title: string
  tutorId: string | null
  tutorPin: string
  tutorName: string
  tutorEmail: string
  tutorPhone: string
  description: string
  createdAt: string
  status: StudentResponseStatus
}

export type StudentResponseFormValues = {
  studentId: string
  tutorId: string
  title: string
  description: string
  status: StudentResponseStatus
}

export type StudentResponseFormErrors = Partial<
  Record<keyof StudentResponseFormValues, string>
>
