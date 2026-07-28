export type StudentResponseStatus = 'pending' | 'approved' | 'void'

export type StudentResponseListItem = {
  id: string
  studentPin: string
  studentName: string
  studentEmail: string
  studentPhone: string
  title: string
  tutorPin: string
  tutorName: string
  tutorEmail: string
  tutorPhone: string
  description: string
  createdAt: string
  status: StudentResponseStatus
}
