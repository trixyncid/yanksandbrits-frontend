/**
 * Human-friendly labels for staff roles.
 * Admins should see page names, not Django model names.
 */

export type PermissionModuleCopy = {
  label: string
  singular: string
  description: string
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
  tutorallocation: {
    label: 'Tutor allocation',
    singular: 'tutor allocation',
    description: 'Private and group classes, their tutors, and their schedule.',
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
  staffsalary: {
    label: 'Staff base pay',
    singular: 'staff salary setting',
    description:
      'Base salary and new student commission for finance, CRO and academic leaders.',
  },
  academicleaderbonustier: {
    label: 'Academic leader bonus tiers',
    singular: 'academic leader bonus tier',
    description: 'Bonus brackets paid to academic leaders.',
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
