/** Django permission codenames used across the admin UI. */

export const PAGE_VIEW_PERMISSIONS = {
  dashboard: 'api_dashboard.view_dashboard',
  studentReport: 'api_dashboard.view_student_report',
  appointmentByTutor: 'api_dashboard.view_appointment_by_tutor',
} as const

export type PermissionModule = {
  view: string
  add: string
  change: string
  delete: string
}

export const PERMISSION_MODULES = {
  students: {
    view: 'students.view_student',
    add: 'students.add_student',
    change: 'students.change_student',
    delete: 'students.delete_student',
  },
  studentGroups: {
    view: 'students.view_studentgroup',
    add: 'students.add_studentgroup',
    change: 'students.change_studentgroup',
    delete: 'students.delete_studentgroup',
  },
  studentPayments: {
    view: 'students.view_studentpayment',
    add: 'students.add_studentpayment',
    change: 'students.change_studentpayment',
    delete: 'students.delete_studentpayment',
  },
  prospectiveStudents: {
    view: 'prospects.view_prospectivestudent',
    add: 'prospects.add_prospectivestudent',
    change: 'prospects.change_prospectivestudent',
    delete: 'prospects.delete_prospectivestudent',
  },
  predictionTests: {
    view: 'prospects.view_prospectivestudentpredictiontest',
    add: 'prospects.add_prospectivestudentpredictiontest',
    change: 'prospects.change_prospectivestudentpredictiontest',
    delete: 'prospects.delete_prospectivestudentpredictiontest',
  },
  programs: {
    view: 'programs.view_program',
    add: 'programs.add_program',
    change: 'programs.change_program',
    delete: 'programs.delete_program',
  },
  classrooms: {
    view: 'classrooms.view_classroom',
    add: 'classrooms.add_classroom',
    change: 'classrooms.change_classroom',
    delete: 'classrooms.delete_classroom',
  },
  schedules: {
    view: 'schedules.view_classschedule',
    add: 'schedules.add_classschedule',
    change: 'schedules.change_classschedule',
    delete: 'schedules.delete_classschedule',
  },
  users: {
    // CustomUser keeps Django app_label="account" (AUTH_USER_MODEL).
    view: 'account.view_customuser',
    add: 'account.add_customuser',
    change: 'account.change_customuser',
    delete: 'account.delete_customuser',
  },
  paidLeaves: {
    view: 'leave.view_paidleave',
    add: 'leave.add_paidleave',
    change: 'leave.change_paidleave',
    delete: 'leave.delete_paidleave',
  },
  branches: {
    view: 'organization.view_branch',
    add: 'organization.add_branch',
    change: 'organization.change_branch',
    delete: 'organization.delete_branch',
  },
  institutions: {
    view: 'lookups.view_institution',
    add: 'lookups.add_institution',
    change: 'lookups.change_institution',
    delete: 'lookups.delete_institution',
  },
  occupations: {
    view: 'lookups.view_occupation',
    add: 'lookups.add_occupation',
    change: 'lookups.change_occupation',
    delete: 'lookups.delete_occupation',
  },
  bookkeeping: {
    view: 'payroll.view_bookkeeping',
    add: 'payroll.add_bookkeeping',
    change: 'payroll.change_bookkeeping',
    delete: 'payroll.delete_bookkeeping',
  },
  tutorSalary: {
    view: 'payroll.view_tutorsalarycalculation',
    add: 'payroll.add_tutorsalarycalculation',
    change: 'payroll.change_tutorsalarycalculation',
    delete: 'payroll.delete_tutorsalarycalculation',
  },
  marketingSalary: {
    view: 'payroll.view_marketingsalarycalculation',
    add: 'payroll.add_marketingsalarycalculation',
    change: 'payroll.change_marketingsalarycalculation',
    delete: 'payroll.delete_marketingsalarycalculation',
  },
} as const satisfies Record<string, PermissionModule>

export type PermissionModuleKey = keyof typeof PERMISSION_MODULES
