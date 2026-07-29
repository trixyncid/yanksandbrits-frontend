import { studentDetailsPlaceholder } from '../../students/data/students-placeholder'
import { tutorListPlaceholder } from '../../tutors/data/tutors-placeholder'
import type {
  StudentResponseFormValues,
  StudentResponseListItem,
} from '../types/student-response'

export const studentResponseStudentOptions = studentDetailsPlaceholder.map(
  (student) => ({
    pin: student.pin,
    fullName: student.fullName,
    email: student.email,
    phone: student.mobilePhone,
  }),
)

export const studentResponseTutorOptions = tutorListPlaceholder
  .filter((tutor) => tutor.isActive)
  .map((tutor) => ({
    pin: tutor.pin,
    fullName: tutor.fullName,
    email: tutor.email,
    phone: tutor.phone,
  }))

export const studentResponseListPlaceholder: StudentResponseListItem[] = [
  {
    id: 'sr1',
    studentPin: 'STU-1001',
    studentName: 'Edward Habel',
    studentEmail: 'edward.habel@email.com',
    studentPhone: '081234567890',
    title: 'Homework Feedback - Week 3',
    tutorPin: 'TUT-012',
    tutorName: 'Sarah Johnson',
    tutorEmail: 'sarah.johnson@ynb.com',
    tutorPhone: '08111222333',
    description:
      'Student submitted reading comprehension worksheet with strong accuracy.',
    createdAt: '2026-04-02T09:15:00',
    status: 'approved',
  },
  {
    id: 'sr2',
    studentPin: 'STU-1002',
    studentName: 'Thalia Aeris',
    studentEmail: 'thalia.aeris@email.com',
    studentPhone: '081298765432',
    title: 'Speaking Practice Notes',
    tutorPin: 'TUT-008',
    tutorName: 'James Whitfield',
    tutorEmail: 'james.whitfield@ynb.com',
    tutorPhone: '08122334455',
    description:
      'Needs more fluency drills before next mock speaking session.',
    createdAt: '2026-04-04T14:40:00',
    status: 'pending',
  },
  {
    id: 'sr3',
    studentPin: 'STU-1003',
    studentName: 'Michael Ari Satria',
    studentEmail: 'michael.ari@email.com',
    studentPhone: '081345678901',
    title: 'Grammar Review Response',
    tutorPin: 'TUT-015',
    tutorName: 'Emily Chen',
    tutorEmail: 'emily.chen@ynb.com',
    tutorPhone: '08133445566',
    description:
      'Completed tense conversion exercises with minor article errors.',
    createdAt: '2026-04-06T11:05:00',
    status: 'approved',
  },
  {
    id: 'sr4',
    studentPin: 'STU-1004',
    studentName: 'Grace Priscilia',
    studentEmail: 'grace.priscilia@email.com',
    studentPhone: '081456789012',
    title: 'Vocabulary Quiz Result',
    tutorPin: 'TUT-012',
    tutorName: 'Sarah Johnson',
    tutorEmail: 'sarah.johnson@ynb.com',
    tutorPhone: '08111222333',
    description: 'Missed session; response marked void pending reschedule.',
    createdAt: '2026-04-08T16:20:00',
    status: 'void',
  },
  {
    id: 'sr5',
    studentPin: 'STU-1006',
    studentName: 'Lisa Vanessa',
    studentEmail: 'lisa.vanessa@email.com',
    studentPhone: '081567890123',
    title: 'Essay Draft Feedback',
    tutorPin: 'TUT-021',
    tutorName: 'Daniel Park',
    tutorEmail: 'daniel.park@ynb.com',
    tutorPhone: '08144556677',
    description: 'Solid thesis structure; recommend clearer topic sentences.',
    createdAt: '2026-04-10T10:50:00',
    status: 'approved',
  },
  {
    id: 'sr6',
    studentPin: 'STU-1007',
    studentName: 'Rafha Charlene',
    studentEmail: 'rafha.charlene@email.com',
    studentPhone: '081678901234',
    title: 'Listening Drill Summary',
    tutorPin: 'TUT-008',
    tutorName: 'James Whitfield',
    tutorEmail: 'james.whitfield@ynb.com',
    tutorPhone: '08122334455',
    description: 'Awaiting tutor confirmation on score adjustment.',
    createdAt: '2026-04-12T13:10:00',
    status: 'pending',
  },
  {
    id: 'sr7',
    studentPin: 'STU-1010',
    studentName: 'Ervina Putri',
    studentEmail: 'ervina.putri@email.com',
    studentPhone: '081789012345',
    title: 'Mock Test Reflection',
    tutorPin: 'TUT-015',
    tutorName: 'Emily Chen',
    tutorEmail: 'emily.chen@ynb.com',
    tutorPhone: '08133445566',
    description:
      'Improved timing on reading section compared to last attempt.',
    createdAt: '2026-04-15T08:35:00',
    status: 'approved',
  },
  {
    id: 'sr8',
    studentPin: 'STU-1013',
    studentName: 'Claire Nadine',
    studentEmail: 'claire.nadine@email.com',
    studentPhone: '081890123456',
    title: 'Pronunciation Checkpoint',
    tutorPin: 'TUT-021',
    tutorName: 'Daniel Park',
    tutorEmail: 'daniel.park@ynb.com',
    tutorPhone: '08144556677',
    description: 'Focus on /θ/ and /ð/ contrasts in next private class.',
    createdAt: '2026-04-17T15:45:00',
    status: 'pending',
  },
]

export const emptyStudentResponseFormValues: StudentResponseFormValues = {
  studentPin: '',
  tutorPin: '',
  title: '',
  description: '',
  status: 'pending',
}

export function studentResponseToFormValues(
  response: StudentResponseListItem,
): StudentResponseFormValues {
  return {
    studentPin: response.studentPin,
    tutorPin: response.tutorPin,
    title: response.title,
    description: response.description,
    status: response.status,
  }
}

export function resolveStudentOption(pin: string) {
  return studentResponseStudentOptions.find((option) => option.pin === pin)
}

export function resolveTutorOption(pin: string) {
  return studentResponseTutorOptions.find((option) => option.pin === pin)
}
