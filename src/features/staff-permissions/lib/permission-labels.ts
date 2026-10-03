/**
 * Human-friendly labels for staff roles.
 * Admins should see page names, not Django model names.
 */

export type PermissionModuleCopy = {
  label: string
  singular: string
  description: string
}

export type PermissionAppCopy = {
  label: string
}

const MODEL_COPY: Record<string, PermissionModuleCopy> = {
  student: {
    label: 'Students',
    singular: 'student',
    description: 'Student list, profiles, contact details, and status.',
  },
  studentgroup: {
    label: 'Student groups',
    singular: 'student group',
    description: 'Class groups and which students belong to them.',
  },
  studentpayment: {
    label: 'Payments',
    singular: 'payment',
    description: 'Tuition payment plans, planned amount, and completion status.',
  },
  studentpaymentterm: {
    label: 'Payment terms',
    singular: 'payment term',
    description: 'Individual installments on a payment, with amount and approval status.',
  },
  studentpaymenttermattachment: {
    label: 'Payment term attachments',
    singular: 'payment term attachment',
    description: 'Receipt files attached to a payment term.',
  },
  studentprogram: {
    label: 'Student programs',
    singular: 'student program',
    description: 'Which programs a student is enrolled in, and their progress.',
  },
  prospectivestudent: {
    label: 'Prospective students',
    singular: 'prospective student',
    description: 'Leads and inquiries from people who are not enrolled yet.',
  },
  prospectivestudentpredictiontest: {
    label: 'Prediction tests',
    singular: 'prediction test',
    description: 'Placement / prediction tests, scores, and payment proof.',
  },
  program: {
    label: 'Programs',
    singular: 'program',
    description: 'Course offerings such as General English or IELTS.',
  },
  classroom: {
    label: 'Classrooms',
    singular: 'classroom',
    description: 'Rooms that can be booked on the timetable.',
  },
  classschedule: {
    label: 'Class schedule',
    singular: 'class session',
    description: 'Timetable sessions for students and tutors.',
  },
  studentclassattendance: {
    label: 'Student attendance',
    singular: 'student attendance record',
    description: 'Whether a student was present in a class session.',
  },
  tutorclassattendance: {
    label: 'Tutor attendance',
    singular: 'tutor attendance record',
    description: 'Whether a tutor was present in a class session.',
  },
  pageaccess: {
    label: 'Admin pages',
    singular: 'admin page',
    description: 'Which report and dashboard pages this role can open.',
  },
  customuser: {
    label: 'Users',
    singular: 'user account',
    description: 'Staff, tutor, and marketing logins.',
  },
  group: {
    label: 'Roles',
    singular: 'role',
    description: 'Access packs that control what staff can do.',
  },
  groupprofile: {
    label: 'Roles',
    singular: 'role',
    description: 'Role settings such as the display name and data scope.',
  },
  permission: {
    label: 'Individual permissions',
    singular: 'permission',
    description: 'Fine-grained permission records (advanced).',
  },
  institution: {
    label: 'Institutions',
    singular: 'institution',
    description: 'Schools, universities, or workplaces on student profiles.',
  },
  occupation: {
    label: 'Occupations',
    singular: 'occupation',
    description: 'Job titles used on student profiles.',
  },
  resource: {
    label: 'Resources',
    singular: 'resource',
    description: 'Lead sources used on prospective student records.',
  },
  branch: {
    label: 'Branches',
    singular: 'branch',
    description: 'School locations and branch settings.',
  },
  paidleave: {
    label: 'Paid leave',
    singular: 'leave request',
    description: 'Staff leave requests and remaining balances.',
  },
  marketingsalary: {
    label: 'Marketing base pay',
    singular: 'marketing salary setting',
    description: 'Base salary settings for marketing staff.',
  },
  marketingbonustier: {
    label: 'Marketing bonus tiers',
    singular: 'bonus tier',
    description: 'Bonus brackets for marketing performance.',
  },
  tutorsalaryclassbased: {
    label: 'Tutor program rates',
    singular: 'tutor rate',
    description: 'How much a tutor is paid per program.',
  },
  tutorsalarybonustier: {
    label: 'Tutor salary bonus tiers',
    singular: 'tutor bonus tier',
    description:
      'Global session-count bonus brackets by full-time/part-time, working days, and period weeks.',
  },
  tutorworkingschedule: {
    label: 'Tutor working hours',
    singular: 'working schedule',
    description: 'Weekly working hours for tutors.',
  },
  bookkeeping: {
    label: 'Bookkeeping',
    singular: 'bookkeeping period',
    description: 'Payroll periods and whether they are open or approved.',
  },
  marketingsalarycalculation: {
    label: 'Marketing pay reports',
    singular: 'marketing pay report',
    description: 'Calculated marketing payroll for a period.',
  },
  tutorsalarycalculation: {
    label: 'Tutor pay reports',
    singular: 'tutor pay report',
    description: 'Calculated tutor payroll for a period.',
  },
  logentry: {
    label: 'Admin activity log',
    singular: 'log entry',
    description: 'System log of admin changes (advanced).',
  },
  contenttype: {
    label: 'Content types',
    singular: 'content type',
    description: 'Internal system metadata (advanced).',
  },
  session: {
    label: 'Login sessions',
    singular: 'login session',
    description: 'Active user login sessions (advanced).',
  },
  blacklistedtoken: {
    label: 'Revoked tokens',
    singular: 'revoked token',
    description: 'Blocked authentication tokens (advanced).',
  },
  outstandingtoken: {
    label: 'Active tokens',
    singular: 'active token',
    description: 'Issued authentication tokens (advanced).',
  },
}

const APP_COPY: Record<string, PermissionAppCopy> = {
  students: { label: 'Students' },
  prospects: { label: 'Leads' },
  programs: { label: 'Academics' },
  classrooms: { label: 'Academics' },
  schedules: { label: 'Academics' },
  account: { label: 'Access' },
  auth: { label: 'Access' },
  lookups: { label: 'Settings' },
  organization: { label: 'Settings' },
  leave: { label: 'People' },
  compensation: { label: 'Finance' },
  payroll: { label: 'Finance' },
  api_dashboard: { label: 'Pages' },
  admin: { label: 'System' },
  contenttypes: { label: 'System' },
  sessions: { label: 'System' },
  token_blacklist: { label: 'System' },
}

/**
 * Internal Django apps shown as one "System" filter chip.
 * `auth` stays out so Roles / permissions land under Access with Users.
 */
export const SYSTEM_APP_LABELS = new Set([
  'admin',
  'contenttypes',
  'sessions',
  'token_blacklist',
])

export const SYSTEM_APP_FILTER_ID = 'system'

export type PermissionAppFilter = {
  id: string
  label: string
  appLabels: string[]
}

function titleCase(value: string) {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getPermissionModuleCopy(
  model: string,
): PermissionModuleCopy {
  return (
    MODEL_COPY[model] ?? {
      label: titleCase(model),
      singular: model,
      description: 'Records in this part of the system.',
    }
  )
}

export function getPermissionAppLabel(appLabel: string) {
  if (SYSTEM_APP_LABELS.has(appLabel)) {
    return 'System'
  }
  return APP_COPY[appLabel]?.label ?? titleCase(appLabel)
}

/**
 * Build unique filter chips. System apps are merged into one chip
 * so admins don't see four tabs all named "System".
 */
export function buildPermissionAppFilters(
  appLabels: string[],
): PermissionAppFilter[] {
  const filters: PermissionAppFilter[] = []
  const seen = new Set<string>()
  const systemLabels: string[] = []

  for (const appLabel of [...appLabels].sort((a, b) => a.localeCompare(b))) {
    if (SYSTEM_APP_LABELS.has(appLabel)) {
      systemLabels.push(appLabel)
      continue
    }

    const label = getPermissionAppLabel(appLabel)
    if (seen.has(label)) {
      const existing = filters.find((filter) => filter.label === label)
      existing?.appLabels.push(appLabel)
      continue
    }

    seen.add(label)
    filters.push({
      id: appLabel,
      label,
      appLabels: [appLabel],
    })
  }

  if (systemLabels.length > 0) {
    filters.push({
      id: SYSTEM_APP_FILTER_ID,
      label: 'System (advanced)',
      appLabels: systemLabels,
    })
  }

  return filters
}

const CODENAME_LABEL_OVERRIDES: Record<string, string> = {
  view_dashboard: 'Open the dashboard',
  view_marketing_dashboard: 'Open marketing performance',
  view_student_report: 'Open student reports',
  view_appointment_by_tutor: 'Open tutor sessions',
}

const CODENAME_HINT_OVERRIDES: Record<string, string> = {
  view_dashboard:
    'Allows this role to open the business dashboard and see KPIs.',
  view_marketing_dashboard:
    'Allows this role to open the personal marketing performance dashboard.',
  view_student_report:
    'Allows this role to open the student registration report.',
  view_appointment_by_tutor:
    'Allows this role to open the tutor sessions / appointment report.',
}

export function getPermissionActionLabel(
  codename: string,
  moduleLabel: string,
  fallback: string,
) {
  if (CODENAME_LABEL_OVERRIDES[codename]) {
    return CODENAME_LABEL_OVERRIDES[codename]
  }
  const prefix = codename.split('_')[0] ?? ''
  const subject = moduleLabel.toLowerCase()
  const labels: Record<string, string> = {
    add: `Add ${subject}`,
    change: `Edit ${subject}`,
    delete: `Delete ${subject}`,
    view: `View ${subject}`,
  }
  return labels[prefix] ?? fallback
}

export function getPermissionActionHint(
  codename: string,
  module: PermissionModuleCopy,
) {
  if (CODENAME_HINT_OVERRIDES[codename]) {
    return CODENAME_HINT_OVERRIDES[codename]
  }
  const prefix = codename.split('_')[0] ?? ''
  const subject = module.singular

  if (prefix === 'view') {
    return `Allows this role to open ${module.label.toLowerCase()} and see existing records.`
  }
  if (prefix === 'add') {
    return `Allows this role to create a new ${subject}.`
  }
  if (prefix === 'change') {
    return `Allows this role to update an existing ${subject}.`
  }
  if (prefix === 'delete') {
    return `Allows this role to permanently delete a ${subject}.`
  }
  return `Special action: ${codename}`
}
