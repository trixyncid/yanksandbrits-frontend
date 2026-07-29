import type { AppointmentReportRow } from '../types/appointment-report'

export const appointmentBranchOptions = [
  { value: 'all', label: 'All Branch' },
  { value: 'main', label: 'Main Branch' },
  { value: 'west', label: 'West Branch' },
  { value: 'south', label: 'South Branch' },
]

export const appointmentTutorOptions = [
  { value: 'tu1', label: 'TUT-012 | Sarah Johnson - Main Branch', branchId: 'main' },
  { value: 'tu2', label: 'TUT-008 | James Whitfield - Main Branch', branchId: 'main' },
  { value: 'tu3', label: 'TUT-015 | Emily Chen - West Branch', branchId: 'west' },
  { value: 'tu4', label: 'TUT-021 | Daniel Park - South Branch', branchId: 'south' },
  { value: 'tu5', label: 'TUT-030 | Ayu Prameswari - West Branch', branchId: 'west' },
]

export const appointmentReportPlaceholderRows: AppointmentReportRow[] = [
  {
    id: 'ap1',
    tutorId: 'tu1',
    program: 'IELTS Intensive',
    tutorName: 'Sarah Johnson',
    studentName: 'Edward Habel',
    appointmentTime: '2026-04-02T16:00:00',
    branch: 'Main Branch',
    dateGroup: '2026-04-02',
  },
  {
    id: 'ap2',
    tutorId: 'tu1',
    program: 'SAT Reading & Writing',
    tutorName: 'Sarah Johnson',
    studentName: 'Thalia Aeris',
    appointmentTime: '2026-04-02T18:00:00',
    branch: 'Main Branch',
    dateGroup: '2026-04-02',
  },
  {
    id: 'ap3',
    tutorId: 'tu1',
    program: 'B Writing',
    tutorName: 'Sarah Johnson',
    studentName: 'Rafha Charlene',
    appointmentTime: '2026-04-03T16:00:00',
    branch: 'Main Branch',
    dateGroup: '2026-04-03',
  },
  {
    id: 'ap4',
    tutorId: 'tu1',
    program: 'IELTS Speaking',
    tutorName: 'Sarah Johnson',
    studentName: 'Claire Nadine',
    appointmentTime: '2026-04-05T15:00:00',
    branch: 'Main Branch',
    dateGroup: '2026-04-05',
  },
  {
    id: 'ap5',
    tutorId: 'tu3',
    program: 'Pre Intermediate',
    tutorName: 'Emily Chen',
    studentName: 'Grace Priscilia',
    appointmentTime: '2026-04-04T16:00:00',
    branch: 'West Branch',
    dateGroup: '2026-04-04',
  },
  {
    id: 'ap6',
    tutorId: 'tu3',
    program: 'Elementary 1 2 3',
    tutorName: 'Emily Chen',
    studentName: 'Michael Ari Satria',
    appointmentTime: '2026-04-06T16:00:00',
    branch: 'West Branch',
    dateGroup: '2026-04-06',
  },
]
