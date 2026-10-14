import { PAGE_VIEW_PERMISSIONS, PERMISSION_MODULES, type PermissionModuleKey } from './permission-catalog'

/**
 * Every sidebar page and what it takes to use it. Opening a page (sidebar
 * entry and URL) is its own permission; reading or changing the page's
 * records is the data module's permissions. A role can have the data without
 * the page ("data only"), e.g. to fill dropdowns on other pages.
 */
export type PageSection =
  | 'Overview'
  | 'Leads'
  | 'Students'
  | 'Academics'
  | 'People'
  | 'Finance'
  | 'Settings'

export type PageKey =
  | 'dashboard'
  | 'marketingDashboard'
  | 'tutorDashboard'
  | 'prospectiveStudents'
  | 'predictionTests'
  | 'students'
  | 'studentGroups'
  | 'studentReport'
  | 'programs'
  | 'classrooms'
  | 'tutorAllocations'
  | 'fullSchedule'
  | 'appointmentByTutor'
  | 'tutors'
  | 'educationCounsellors'
  | 'paidLeaves'
  | 'users'
  | 'studentPayments'
  | 'bookkeeping'
  | 'tutorReport'
  | 'tutorSalaryBonus'
  | 'marketingReport'
  | 'branches'
  | 'institutions'
  | 'occupations'
  | 'resources'

export type PageDefinition = {
  key: PageKey
  label: string
  section: PageSection
  /** Route prefix the page lives under. */
  route: string
  /** Permission that shows the page in the sidebar and opens its URL. */
  openPermission: string
  /** Records the page works with; absent for report/dashboard pages. */
  module?: PermissionModuleKey
  /** Other pages whose data this page reads (dropdowns, pickers). */
  needs?: PageKey[]
  description: string
}

const open = (codename: string) => `api_dashboard.${codename}`

export const PAGES: PageDefinition[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    section: 'Overview',
    route: '/dashboard',
    openPermission: PAGE_VIEW_PERMISSIONS.dashboard,
    description: 'Business overview: revenue, enrollments, capacity.',
  },
  {
    key: 'marketingDashboard',
    label: 'My Performance (counsellor)',
    section: 'Overview',
    route: '/marketing-dashboard',
    openPermission: PAGE_VIEW_PERMISSIONS.marketingDashboard,
    description: "A counsellor's own leads, commission and expected pay.",
  },
  {
    key: 'tutorDashboard',
    label: 'My Performance (tutor)',
    section: 'Overview',
    route: '/tutor-dashboard',
    openPermission: 'api_dashboard.view_tutor_dashboard',
    description: "A tutor's own sessions, pay and goals.",
  },
  {
    key: 'prospectiveStudents',
    label: 'Student Responses',
    section: 'Leads',
    route: '/prospective-students',
    openPermission: open('open_prospective_students'),
    module: 'prospectiveStudents',
    needs: ['educationCounsellors', 'branches', 'resources'],
    description: 'Leads and inquiries before enrollment.',
  },
  {
    key: 'predictionTests',
    label: 'Prediction Test',
    section: 'Leads',
    route: '/prediction-tests',
    openPermission: open('open_prediction_tests'),
    module: 'predictionTests',
    needs: ['prospectiveStudents', 'tutors', 'branches'],
    description: 'Placement tests, scores and the test fee.',
  },
  {
    key: 'students',
    label: 'Student List',
    section: 'Students',
    route: '/students',
    openPermission: open('open_students'),
    module: 'students',
    needs: ['programs', 'branches', 'institutions', 'occupations'],
    description: 'Enrolled students and their profiles.',
  },
  {
    key: 'studentGroups',
    label: 'Student Group',
    section: 'Students',
    route: '/student-groups',
    openPermission: open('open_student_groups'),
    module: 'studentGroups',
    needs: ['students'],
    description: 'Groups of students who study together.',
  },
  {
    key: 'studentReport',
    label: 'Student Report',
    section: 'Students',
    route: '/student-report',
    openPermission: PAGE_VIEW_PERMISSIONS.studentReport,
    needs: ['branches'],
    description: 'Downloadable report of registrations.',
  },
  {
    key: 'programs',
    label: 'Program',
    section: 'Academics',
    route: '/programs',
    openPermission: open('open_programs'),
    module: 'programs',
    description: 'Course catalog with subjects and schedule colors.',
  },
  {
    key: 'classrooms',
    label: 'Classroom',
    section: 'Academics',
    route: '/classrooms',
    openPermission: open('open_classrooms'),
    module: 'classrooms',
    needs: ['branches'],
    description: 'Rooms at each branch.',
  },
  {
    key: 'tutorAllocations',
    label: 'Tutor Allocation',
    section: 'Academics',
    route: '/tutor-allocations',
    openPermission: open('open_tutor_allocations'),
    module: 'tutorAllocations',
    needs: ['students', 'studentGroups', 'programs', 'tutors'],
    description: 'Classes, sections and the tutors assigned to them.',
  },
  {
    key: 'fullSchedule',
    label: 'Full Schedule',
    section: 'Academics',
    route: '/full-schedule',
    openPermission: open('open_full_schedule'),
    module: 'schedules',
    needs: ['classrooms', 'programs', 'students', 'studentGroups', 'tutors', 'branches'],
    description: 'Booked sessions per room and tutor.',
  },
  {
    key: 'appointmentByTutor',
    label: 'Tutor Sessions',
    section: 'Academics',
    route: '/appointment-by-tutor',
    openPermission: PAGE_VIEW_PERMISSIONS.appointmentByTutor,
    needs: ['tutors', 'branches'],
    description: 'Report of sessions taught by a tutor.',
  },
  {
    key: 'tutors',
    label: 'Tutor List',
    section: 'People',
    route: '/tutors',
    openPermission: open('open_tutors'),
    module: 'users',
    description: 'Tutors, their subjects, hours and pay.',
  },
  {
    key: 'educationCounsellors',
    label: 'Education Counsellors',
    section: 'People',
    route: '/marketings',
    openPermission: open('open_education_counsellors'),
    module: 'users',
    description: 'Counsellors and branch managers, with commission setup.',
  },
  {
    key: 'paidLeaves',
    label: 'Paid Leave',
    section: 'People',
    route: '/paid-leaves',
    openPermission: open('open_paid_leaves'),
    module: 'paidLeaves',
    needs: ['users'],
    description: 'Leave requests and approvals.',
  },
  {
    key: 'users',
    label: 'Users',
    section: 'People',
    route: '/users',
    openPermission: open('open_users'),
    module: 'users',
    description: 'Every staff account and its role.',
  },
  {
    key: 'studentPayments',
    label: 'Payment',
    section: 'Finance',
    route: '/student-payments',
    openPermission: open('open_student_payments'),
    module: 'studentPayments',
    needs: ['students', 'prospectiveStudents', 'branches'],
    description: 'Payment plans, installments and approvals.',
  },
  {
    key: 'bookkeeping',
    label: 'Bookkeeping',
    section: 'Finance',
    route: '/bookkeeping',
    openPermission: open('open_bookkeeping'),
    module: 'bookkeeping',
    needs: ['branches'],
    description: 'Payroll periods and saved salaries.',
  },
  {
    key: 'tutorReport',
    label: 'Tutor Report',
    section: 'Finance',
    route: '/tutor-report',
    openPermission: open('open_tutor_report'),
    module: 'tutorSalary',
    needs: ['bookkeeping'],
    description: 'Tutor salaries per period.',
  },
  {
    key: 'tutorSalaryBonus',
    label: 'Tutor Salary Bonus',
    section: 'Finance',
    route: '/tutor-salary-bonus',
    openPermission: open('open_tutor_salary_bonus'),
    module: 'tutorSalaryBonus',
    description: 'Company-wide session bonus brackets.',
  },
  {
    key: 'marketingReport',
    label: 'Marketing Report',
    section: 'Finance',
    route: '/marketing-report',
    openPermission: open('open_marketing_report'),
    module: 'marketingSalary',
    needs: ['bookkeeping'],
    description: 'Counsellor salaries per period.',
  },
  {
    key: 'branches',
    label: 'Branch',
    section: 'Settings',
    route: '/branches',
    openPermission: open('open_branches'),
    module: 'branches',
    description: 'Branches and their details.',
  },
  {
    key: 'institutions',
    label: 'Institutions',
    section: 'Settings',
    route: '/institutions',
    openPermission: open('open_institutions'),
    module: 'institutions',
    description: 'Schools and universities students come from.',
  },
  {
    key: 'occupations',
    label: 'Occupations',
    section: 'Settings',
    route: '/occupations',
    openPermission: open('open_occupations'),
    module: 'occupations',
    description: "Students' occupations.",
  },
  {
    key: 'resources',
    label: 'Lead Sources',
    section: 'Settings',
    route: '/resources',
    openPermission: open('open_resources'),
    module: 'resources',
    description: 'Where leads come from, and which earn commission.',
  },
]

export const PAGE_SECTIONS: PageSection[] = [
  'Overview',
  'Leads',
  'Students',
  'Academics',
  'People',
  'Finance',
  'Settings',
]

export const PAGES_BY_KEY = Object.fromEntries(
  PAGES.map((page) => [page.key, page]),
) as Record<PageKey, PageDefinition>

/** Data permissions (view/add/change/delete) for a page, if it has records. */
export function pageDataPermissions(page: PageDefinition) {
  return page.module ? PERMISSION_MODULES[page.module] : null
}

/** The page that owns a URL, longest matching route first. */
export function pageForPath(pathname: string): PageDefinition | null {
  return (
    [...PAGES]
      .sort((a, b) => b.route.length - a.route.length)
      .find(
        (page) => pathname === page.route || pathname.startsWith(`${page.route}/`),
      ) ?? null
  )
}
