import { pageDataPermissions, type PageDefinition, type PageKey } from '../../auth/lib/page-catalog'
import { getPermissionModuleCopy } from './permission-labels'

export type DataAction = 'view' | 'add' | 'change' | 'delete'

export const DATA_ACTIONS: DataAction[] = ['view', 'add', 'change', 'delete']

export const ACTION_LABEL: Record<DataAction, string> = {
  view: 'Read',
  add: 'Create',
  change: 'Edit',
  delete: 'Delete',
}

/** One kind of record a role can read or change, e.g. "Program pay rates". */
export type RecordSet = {
  /** "app_label.model" */
  key: string
  label: string
  description: string
  /** "app_label.codename" per action. */
  permissions: Record<DataAction, string>
}

function recordSet(
  appLabel: string,
  model: string,
  copy?: { label: string; description: string },
): RecordSet {
  const fallback = getPermissionModuleCopy(model)
  return {
    key: `${appLabel}.${model}`,
    label: copy?.label ?? fallback.label,
    description: copy?.description ?? fallback.description,
    permissions: {
      view: `${appLabel}.view_${model}`,
      add: `${appLabel}.add_${model}`,
      change: `${appLabel}.change_${model}`,
      delete: `${appLabel}.delete_${model}`,
    },
  }
}

/**
 * Settings that live inside a page rather than on their own page, e.g. a
 * tutor's pay rates are edited from the Tutor List. Listed under that page so
 * every permission has one home on the Role page.
 */
const PAGE_RELATED: Partial<Record<PageKey, RecordSet[]>> = {
  students: [
    recordSet('students', 'studentprogram', {
      label: 'Enrolled programs',
      description: 'Programs on a student’s profile.',
    }),
  ],
  studentPayments: [
    recordSet('students', 'studentpaymentterm', {
      label: 'Installments',
      description: 'Each payment in a plan, and approving it.',
    }),
    recordSet('students', 'studentpaymenttermattachment', {
      label: 'Payment proofs',
      description: 'Receipts uploaded against an installment.',
    }),
  ],
  fullSchedule: [
    recordSet('schedules', 'studentclassattendance', {
      label: 'Student attendance',
      description: 'Marking students present or absent.',
    }),
    recordSet('schedules', 'tutorclassattendance', {
      label: 'Tutor attendance',
      description: 'Marking tutors present for a session.',
    }),
  ],
  tutors: [
    recordSet('compensation', 'tutorsalaryclassbased', {
      label: 'Program pay rates',
      description: 'What a tutor earns per program.',
    }),
    recordSet('compensation', 'tutorworkingschedule', {
      label: 'Working hours',
      description: 'A tutor’s weekly schedule.',
    }),
  ],
  educationCounsellors: [
    recordSet('compensation', 'marketingsalary', {
      label: 'Base pay',
      description: 'A counsellor’s salary setup.',
    }),
    recordSet('compensation', 'marketingcommissiontier', {
      label: 'Commission tiers',
      description: 'Commission brackets by revenue.',
    }),
    recordSet('compensation', 'marketingbonustier', {
      label: 'Bonus tiers',
      description: 'Bonus brackets by performance.',
    }),
  ],
  bookkeeping: [
    recordSet('payroll', 'staffsalarycalculation', {
      label: 'Staff pay reports',
      description: 'Saved salaries for finance, CRO and academic leaders.',
    }),
  ],
  users: [
    recordSet('compensation', 'staffsalary', {
      label: 'Staff base pay',
      description: 'Salary for finance, CRO and academic leaders.',
    }),
    recordSet('compensation', 'academicleaderbonustier', {
      label: 'Academic leader bonus tiers',
      description: 'Bonus brackets for academic leaders.',
    }),
  ],
}

/** The page's own records, if it has any. */
export function mainRecords(page: PageDefinition): RecordSet | null {
  const data = pageDataPermissions(page)
  if (!data) return null
  const [appLabel, codename] = data.view.split('.')
  const model = codename!.replace(/^view_/, '')
  return { ...recordSet(appLabel!, model), permissions: { ...data } }
}

export function relatedRecords(page: PageDefinition): RecordSet[] {
  return PAGE_RELATED[page.key] ?? []
}

/** Every record set the page controls: its own first, then related settings. */
export function pageRecords(page: PageDefinition): RecordSet[] {
  const main = mainRecords(page)
  return main ? [main, ...relatedRecords(page)] : relatedRecords(page)
}
