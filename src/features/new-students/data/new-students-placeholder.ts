import { marketingListPlaceholder } from '../../marketings/data/marketings-placeholder'
import { branchListPlaceholder } from '../../branches/data/branches-placeholder'
import type {
  NewStudentFormValues,
  NewStudentListItem,
} from '../types/new-student'

export const newStudentCourseOptions = [
  'TOEFL Preparation',
  'General English',
  'IELTS Preparation',
  'SAT Intensive',
  'HSK Preparation',
  'Business English',
  'Kids English',
  'Other',
] as const

export const newStudentCounsellorOptions = marketingListPlaceholder
  .filter((item) => item.isActive)
  .map((item) => ({
    id: item.id,
    fullName: item.fullName,
    branch: item.branch,
  }))

export const newStudentBranchOptions = branchListPlaceholder.map((branch) => ({
  id: branch.id,
  name: branch.name,
}))

export const newStudentListPlaceholder: NewStudentListItem[] = [
  {
    id: 'ns1',
    fullName: 'Andrea Putri',
    email: 'andrea.putri@email.com',
    phone: '081211122233',
    gender: 'female',
    course: 'IELTS Preparation',
    status: 'waiting',
    educationCounsellor: 'Clara Wijaya',
    createdAt: '2026-04-01T09:00:00',
    updatedAt: '2026-04-01T09:00:00',
    branch: 'Main Branch',
  },
  {
    id: 'ns2',
    fullName: 'Bagas Pratama',
    email: 'bagas.pratama@email.com',
    phone: '081233344455',
    gender: 'male',
    course: 'SAT Intensive',
    status: 'follow_up',
    educationCounsellor: 'Kevin Pratama',
    createdAt: '2026-04-03T11:20:00',
    updatedAt: '2026-04-03T11:20:00',
    branch: 'Main Branch',
  },
  {
    id: 'ns3',
    fullName: 'Cindy Aurelia',
    email: 'cindy.aurelia@email.com',
    phone: '081255566677',
    gender: 'female',
    course: 'General English',
    status: 'consult',
    educationCounsellor: 'Nadine Siregar',
    createdAt: '2026-04-05T14:15:00',
    updatedAt: '2026-04-05T14:15:00',
    branch: 'West Branch',
  },
  {
    id: 'ns4',
    fullName: 'Doni Saputra',
    email: 'doni.saputra@email.com',
    phone: '081277788899',
    gender: 'male',
    course: 'TOEFL Preparation',
    status: 'prediction_test',
    educationCounsellor: 'Clara Wijaya',
    createdAt: '2026-04-07T10:40:00',
    updatedAt: '2026-04-07T10:40:00',
    branch: 'South Branch',
  },
  {
    id: 'ns5',
    fullName: 'Elena Marissa',
    email: 'elena.marissa@email.com',
    phone: '081299900011',
    gender: 'female',
    course: 'Business English',
    status: 'cancelled',
    educationCounsellor: 'Daniel Lim',
    createdAt: '2026-04-09T16:05:00',
    updatedAt: '2026-04-09T16:05:00',
    branch: 'West Branch',
  },
  {
    id: 'ns6',
    fullName: 'Farhan Rizky',
    email: 'farhan.rizky@email.com',
    phone: '081212131415',
    gender: 'male',
    course: 'IELTS Preparation',
    status: 'follow_up',
    educationCounsellor: 'Kevin Pratama',
    createdAt: '2026-04-11T09:50:00',
    updatedAt: '2026-04-11T09:50:00',
    branch: 'Main Branch',
  },
  {
    id: 'ns7',
    fullName: 'Gita Maharani',
    email: 'gita.maharani@email.com',
    phone: '081216171819',
    gender: 'female',
    course: 'Kids English',
    status: 'waiting',
    educationCounsellor: 'Nadine Siregar',
    createdAt: '2026-04-13T13:25:00',
    updatedAt: '2026-04-13T13:25:00',
    branch: 'West Branch',
  },
  {
    id: 'ns8',
    fullName: 'Hendra Wijaya',
    email: 'hendra.wijaya@email.com',
    phone: '081220212223',
    gender: 'male',
    course: 'SAT Intensive',
    status: 'consult',
    educationCounsellor: 'Daniel Lim',
    createdAt: '2026-04-15T15:10:00',
    updatedAt: '2026-04-15T15:10:00',
    branch: 'Main Branch',
  },
  {
    id: 'ns9',
    fullName: 'Irene Felicia',
    email: 'irene.felicia@email.com',
    phone: '081224252627',
    gender: 'female',
    course: 'General English',
    status: 'prediction_test',
    educationCounsellor: 'Clara Wijaya',
    createdAt: '2026-04-17T08:45:00',
    updatedAt: '2026-04-17T08:45:00',
    branch: 'South Branch',
  },
  {
    id: 'ns10',
    fullName: 'Jonathan Lee',
    email: 'jonathan.lee@email.com',
    phone: '081228293031',
    gender: 'male',
    course: 'TOEFL Preparation',
    status: 'waiting',
    educationCounsellor: 'Kevin Pratama',
    createdAt: '2026-04-19T12:00:00',
    updatedAt: '2026-04-19T12:00:00',
    branch: 'Main Branch',
  },
]

export const emptyNewStudentFormValues: NewStudentFormValues = {
  fullName: '',
  email: '',
  phone: '',
  gender: '',
  course: '',
  status: 'waiting',
  educationCounsellor: '',
  branch: 'Main Branch',
}

export function newStudentToFormValues(
  student: NewStudentListItem,
): NewStudentFormValues {
  return {
    fullName: student.fullName,
    email: student.email,
    phone: student.phone,
    gender: student.gender,
    course: student.course,
    status: student.status,
    educationCounsellor: student.educationCounsellor,
    branch: student.branch,
  }
}
