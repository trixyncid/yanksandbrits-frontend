import type {
  StudentDetail,
  StudentFormValues,
  StudentListItem,
  StudentProgramItem,
} from '../types/student'

const defaultPrograms = (studentId: string): StudentProgramItem[] => [
  {
    id: `${studentId}-prog-1`,
    code: 'ENG-CONV',
    title: 'Conversational English',
    description: 'General speaking track',
    period: 'Jan – Jun 2026',
    sessions: 24,
    sessionsUsed: 10,
    firstMeeting: '2026-01-20',
    lastMeeting: '2026-04-10',
    progress: 42,
    status: 'ongoing',
  },
  {
    id: `${studentId}-prog-2`,
    code: 'IELTS-PREP',
    title: 'IELTS Preparation',
    description: 'Academic writing focus',
    period: 'Mar – Aug 2026',
    sessions: 36,
    sessionsUsed: 6,
    firstMeeting: '2026-03-05',
    lastMeeting: '2026-04-12',
    progress: 17,
    status: 'ongoing',
  },
]

function buildDetail(
  base: Omit<StudentListItem, never> & {
    birthPlace?: string
    birthDate?: string
    address?: string
    homePhone?: string
    othersPhone?: string
    occupation?: string
    institution?: string
    referral?: string
    grn?: string
    paymentStatus?: StudentDetail['paymentStatus']
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
    programs?: StudentProgramItem[]
  },
): StudentDetail {
  return {
    id: base.id,
    pin: base.pin,
    fullName: base.fullName,
    email: base.email,
    gender: base.gender,
    birthPlace: base.birthPlace ?? 'Jakarta',
    birthDate: base.birthDate ?? '2005-05-12',
    address: base.address ?? 'Jakarta, Indonesia',
    mobilePhone: base.mobilePhone,
    homePhone: base.homePhone ?? '-',
    othersPhone: base.othersPhone ?? '-',
    occupation: base.occupation ?? 'Student',
    institution: base.institution ?? 'Local Senior High School',
    enrollmentDate: base.enrollmentDate,
    status: base.status,
    paymentStatus: base.paymentStatus ?? 'paid',
    counsellor: base.counsellor,
    referral: base.referral ?? '-',
    grn: base.grn ?? `GRN-${base.pin.replace('STU-', '')}`,
    branch: base.branch,
    createdAt: base.createdAt ?? `${base.enrollmentDate}T09:00:00`,
    updatedAt: base.updatedAt ?? `${base.enrollmentDate}T09:00:00`,
    createdBy: base.createdBy ?? base.counsellor,
    updatedBy: base.updatedBy ?? base.counsellor,
    programs: base.programs ?? defaultPrograms(base.id),
  }
}

export const studentDetailsPlaceholder: StudentDetail[] = [
  buildDetail({
    id: '1',
    pin: 'STU-1001',
    fullName: 'Edward Habel',
    email: 'edward.habel@email.com',
    mobilePhone: '0812-3456-7890',
    gender: 'M',
    enrollmentDate: '2026-01-12',
    counsellor: 'Clara Wijaya',
    branch: 'Main Branch',
    status: 'active',
    birthPlace: 'Medan',
    birthDate: '2004-08-21',
    address: 'Jl. Sudirman No. 12, Jakarta Pusat',
    homePhone: '021-555-0101',
    occupation: 'University Student',
    institution: 'Universitas Indonesia',
    paymentStatus: 'paid',
  }),
  buildDetail({
    id: '2',
    pin: 'STU-1002',
    fullName: 'Thalia Aeris',
    email: 'thalia.aeris@email.com',
    mobilePhone: '0813-2221-0098',
    gender: 'F',
    enrollmentDate: '2026-01-18',
    counsellor: 'Kevin Pratama',
    branch: 'Main Branch',
    status: 'active',
    birthPlace: 'Bandung',
    birthDate: '2005-02-14',
    paymentStatus: 'pending',
  }),
  buildDetail({
    id: '3',
    pin: 'STU-1003',
    fullName: 'Michael Ari Satria',
    email: 'michael.satria@email.com',
    mobilePhone: '0817-5544-1122',
    gender: 'M',
    enrollmentDate: '2026-02-02',
    counsellor: 'Nadine Siregar',
    branch: 'West Branch',
    status: 'active',
  }),
  buildDetail({
    id: '4',
    pin: 'STU-1004',
    fullName: 'Grace Priscilia',
    email: 'grace.priscilia@email.com',
    mobilePhone: '0819-7788-3344',
    gender: 'F',
    enrollmentDate: '2026-02-10',
    counsellor: 'Clara Wijaya',
    branch: 'South Branch',
    status: 'inactive',
    paymentStatus: 'pending',
  }),
  buildDetail({
    id: '5',
    pin: 'STU-1005',
    fullName: 'Aufa Qutby Sidabutar',
    email: 'aufa.sidabutar@email.com',
    mobilePhone: '0821-9900-5566',
    gender: 'M',
    enrollmentDate: '2026-02-14',
    counsellor: 'Daniel Lim',
    branch: 'Main Branch',
    status: 'active',
  }),
  buildDetail({
    id: '6',
    pin: 'STU-1006',
    fullName: 'Lisa Vanessa',
    email: 'lisa.vanessa@email.com',
    mobilePhone: '0812-6677-8899',
    gender: 'F',
    enrollmentDate: '2026-02-20',
    counsellor: 'Kevin Pratama',
    branch: 'West Branch',
    status: 'active',
  }),
  buildDetail({
    id: '7',
    pin: 'STU-1007',
    fullName: 'Rafha Charlene',
    email: 'rafha.charlene@email.com',
    mobilePhone: '0815-2233-4455',
    gender: 'F',
    enrollmentDate: '2026-03-01',
    counsellor: 'Nadine Siregar',
    branch: 'Main Branch',
    status: 'active',
  }),
  buildDetail({
    id: '8',
    pin: 'STU-1008',
    fullName: 'Louis Theo',
    email: 'louis.theo@email.com',
    mobilePhone: '0816-3344-5566',
    gender: 'M',
    enrollmentDate: '2026-03-05',
    counsellor: 'Daniel Lim',
    branch: 'South Branch',
    status: 'inactive',
  }),
  buildDetail({
    id: '9',
    pin: 'STU-1009',
    fullName: 'Arthabella Elizabeth',
    email: 'arthabella.elizabeth@email.com',
    mobilePhone: '0818-4455-6677',
    gender: 'F',
    enrollmentDate: '2026-03-12',
    counsellor: 'Clara Wijaya',
    branch: 'Main Branch',
    status: 'active',
  }),
  buildDetail({
    id: '10',
    pin: 'STU-1010',
    fullName: 'Ervina Putri',
    email: 'ervina.putri@email.com',
    mobilePhone: '0822-5566-7788',
    gender: 'F',
    enrollmentDate: '2026-03-18',
    counsellor: 'Kevin Pratama',
    branch: 'West Branch',
    status: 'active',
  }),
  buildDetail({
    id: '11',
    pin: 'STU-1011',
    fullName: 'Joyce Amanda',
    email: 'joyce.amanda@email.com',
    mobilePhone: '0811-6677-8890',
    gender: 'F',
    enrollmentDate: '2026-03-22',
    counsellor: 'Nadine Siregar',
    branch: 'Main Branch',
    status: 'active',
  }),
  buildDetail({
    id: '12',
    pin: 'STU-1012',
    fullName: 'Theo Gunawan',
    email: 'theo.gunawan@email.com',
    mobilePhone: '0813-7788-9900',
    gender: 'M',
    enrollmentDate: '2026-04-01',
    counsellor: 'Daniel Lim',
    branch: 'South Branch',
    status: 'inactive',
  }),
  buildDetail({
    id: '13',
    pin: 'STU-1013',
    fullName: 'Claire Nadine',
    email: 'claire.nadine@email.com',
    mobilePhone: '0814-8899-0011',
    gender: 'F',
    enrollmentDate: '2026-04-08',
    counsellor: 'Clara Wijaya',
    branch: 'Main Branch',
    status: 'active',
  }),
  buildDetail({
    id: '14',
    pin: 'STU-1014',
    fullName: 'Aurelne Putri',
    email: 'aurelne.putri@email.com',
    mobilePhone: '0817-9900-1122',
    gender: 'F',
    enrollmentDate: '2026-04-15',
    counsellor: 'Kevin Pratama',
    branch: 'West Branch',
    status: 'active',
  }),
  buildDetail({
    id: '15',
    pin: 'STU-1015',
    fullName: 'Habell Edward',
    email: 'habell.edward@email.com',
    mobilePhone: '0821-0011-2233',
    gender: 'M',
    enrollmentDate: '2026-04-20',
    counsellor: 'Nadine Siregar',
    branch: 'Main Branch',
    status: 'active',
  }),
]

export const studentListPlaceholder: StudentListItem[] =
  studentDetailsPlaceholder.map(toStudentListItem)

export function toStudentListItem(student: StudentDetail): StudentListItem {
  return {
    id: student.id,
    pin: student.pin,
    fullName: student.fullName,
    email: student.email,
    mobilePhone: student.mobilePhone,
    gender: student.gender,
    enrollmentDate: student.enrollmentDate,
    counsellor: student.counsellor,
    branch: student.branch,
    status: student.status,
  }
}

export function studentDetailToFormValues(
  student: StudentDetail,
): StudentFormValues {
  return {
    pin: student.pin,
    fullName: student.fullName,
    email: student.email,
    gender: student.gender,
    birthPlace: student.birthPlace,
    birthDate: student.birthDate,
    address: student.address,
    mobilePhone: student.mobilePhone,
    homePhone: student.homePhone === '-' ? '' : student.homePhone,
    othersPhone: student.othersPhone === '-' ? '' : student.othersPhone,
    occupation: student.occupation,
    institution: student.institution,
    enrollmentDate: student.enrollmentDate,
    counsellor: student.counsellor,
    referral: student.referral === '-' ? '' : student.referral,
    grn: student.grn,
    branch: student.branch,
    status: student.status,
  }
}

export function getStudentInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export const studentBranchOptions = [
  'Main Branch',
  'West Branch',
  'South Branch',
] as const

export const studentCounsellorOptions = [
  'Clara Wijaya',
  'Kevin Pratama',
  'Nadine Siregar',
  'Daniel Lim',
] as const

export const studentOccupationOptions = [
  'Student',
  'University Student',
  'Employee',
  'Entrepreneur',
  'Other',
] as const

export const emptyStudentFormValues: StudentFormValues = {
  pin: '',
  fullName: '',
  email: '',
  gender: 'M',
  birthPlace: '',
  birthDate: '',
  address: '',
  mobilePhone: '',
  homePhone: '',
  othersPhone: '',
  occupation: 'Student',
  institution: '',
  enrollmentDate: new Date().toISOString().slice(0, 10),
  counsellor: 'Clara Wijaya',
  referral: '',
  grn: '',
  branch: 'Main Branch',
  status: 'active',
}
