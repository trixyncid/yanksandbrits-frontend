/**
 * Human-friendly labels for Django permission models.
 * Keeps the permission browser readable for admins (not engineers).
 */

export type PermissionModuleCopy = {
  label: string
  description: string
}

export type PermissionAppCopy = {
  label: string
}

const MODEL_COPY: Record<string, PermissionModuleCopy> = {
  // Students
  student: {
    label: 'Students',
    description: 'Enrolled student profiles, contact details, and status.',
  },
  studentgroup: {
    label: 'Student Groups',
    description: 'Class groups and which students belong to them.',
  },
  studentpayment: {
    label: 'Student Payments',
    description: 'Payment records, amounts, and approval status.',
  },
  studentprogram: {
    label: 'Student Programs',
    description: 'Program enrollments, sessions, and progress.',
  },

  // Marketing / prospects
  prospectivestudent: {
    label: 'Prospective Students',
    description: 'Prospective student inquiries and marketing leads.',
  },
  prospectivestudentpredictiontest: {
    label: 'Prediction Tests',
    description: 'Placement / prediction test scores and payment proof.',
  },

  // Academic
  program: {
    label: 'Programs',
    description: 'Course offerings such as General English or IELTS.',
  },
  classroom: {
    label: 'Classrooms',
    description: 'Rooms available for scheduling classes.',
  },
  classschedule: {
    label: 'Class Sessions',
    description: 'Timetable sessions for students and tutors.',
  },
  studentclassattendance: {
    label: 'Student Attendance',
    description: 'Whether a student attended a class session.',
  },
  tutorclassattendance: {
    label: 'Tutor Attendance',
    description: 'Whether a tutor attended a class session.',
  },

  // Staff / users
  customuser: {
    label: 'Staff Accounts',
    description: 'Staff, tutor, and marketing user accounts.',
  },
  group: {
    label: 'Permission Groups',
    description: 'Access packs that control what staff can do.',
  },
  permission: {
    label: 'Individual Permissions',
    description: 'Fine-grained permission records (advanced).',
  },

  // Lookups
  institution: {
    label: 'Institutions',
    description:
      'Schools, universities, or workplaces students can be linked to.',
  },
  occupation: {
    label: 'Occupations',
    description: 'Job or occupation options used on student profiles.',
  },

  // Organization
  branch: {
    label: 'Branches',
    description: 'School branch locations and branch settings.',
  },
  brand: {
    label: 'Brands',
    description: 'Brand identity linked to branches.',
  },

  // Leave / compensation / payroll
  paidleave: {
    label: 'Paid Leave',
    description: 'Staff leave requests and balances.',
  },
  marketingsalary: {
    label: 'Marketing Salaries',
    description: 'Base salary settings for marketing staff.',
  },
  marketingbonustier: {
    label: 'Marketing Bonus Tiers',
    description: 'Bonus brackets for marketing performance.',
  },
  tutorsalaryclassbased: {
    label: 'Tutor Program Rates',
    description: 'Per-program pay rates for tutors.',
  },
  tutorworkingschedule: {
    label: 'Tutor Working Hours',
    description: 'Weekly working schedule for tutors.',
  },
  bookkeeping: {
    label: 'Bookkeeping Periods',
    description: 'Payroll / bookkeeping periods and approvals.',
  },
  marketingsalarycalculation: {
    label: 'Marketing Pay Calculations',
    description: 'Calculated marketing payroll amounts.',
  },
  tutorsalarycalculation: {
    label: 'Tutor Pay Calculations',
    description: 'Calculated tutor payroll amounts.',
  },

  // Django internals (rarely needed)
  logentry: {
    label: 'Admin Activity Log',
    description: 'System log of admin changes (advanced).',
  },
  contenttype: {
    label: 'Content Types',
    description: 'Internal system metadata (advanced).',
  },
  session: {
    label: 'Login Sessions',
    description: 'Active user login sessions (advanced).',
  },
  blacklistedtoken: {
    label: 'Revoked Tokens',
    description: 'Blocked authentication tokens (advanced).',
  },
  outstandingtoken: {
    label: 'Active Tokens',
    description: 'Issued authentication tokens (advanced).',
  },
}

const APP_COPY: Record<string, PermissionAppCopy> = {
  students: { label: 'Students' },
  prospects: { label: 'Marketing leads' },
  programs: { label: 'Programs' },
  classrooms: { label: 'Classrooms' },
  schedules: { label: 'Schedule' },
  account: { label: 'Staff accounts' },
  auth: { label: 'Access control' },
  lookups: { label: 'Reference lists' },
  organization: { label: 'Organization' },
  leave: { label: 'Leave' },
  compensation: { label: 'Compensation' },
  payroll: { label: 'Payroll' },
  admin: { label: 'System' },
  contenttypes: { label: 'System' },
  sessions: { label: 'System' },
  token_blacklist: { label: 'System' },
}

/** Internal Django apps shown as one "System" filter chip. */
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

export function getPermissionActionLabel(codename: string, fallback: string) {
  const prefix = codename.split('_')[0] ?? ''
  const labels: Record<string, string> = {
    add: 'Create',
    change: 'Edit',
    delete: 'Delete',
    view: 'View',
  }
  return labels[prefix] ?? fallback
}

export function getPermissionActionHint(
  codename: string,
  moduleLabel: string,
) {
  const prefix = codename.split('_')[0] ?? ''
  const subject = moduleLabel.toLowerCase()

  if (prefix === 'view') {
    return `Can open and browse ${subject}.`
  }
  if (prefix === 'add') {
    return `Can add new ${subject}.`
  }
  if (prefix === 'change') {
    return `Can edit existing ${subject}.`
  }
  if (prefix === 'delete') {
    return `Can permanently remove ${subject}.`
  }
  return `Special action: ${codename}`
}
