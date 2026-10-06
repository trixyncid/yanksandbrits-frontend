import { parseCurrencyValue } from '../../../shared/lib/currency'
import type {
  StudentPaymentListItem,
  StudentPaymentPlanStatus,
  StudentPaymentTerm,
  StudentPaymentTermFormValues,
  StudentPaymentTermStatus,
} from '../types/student-payment'

export type PaymentCollectionSummary = {
  planned: number
  approved: number
  pending: number
  voided: number
  remaining: number
  percent: number
  approvedCount: number
  pendingCount: number
  voidCount: number
}

export function planStatusLabel(status: StudentPaymentPlanStatus) {
  return status === 'complete' ? 'Complete' : 'Incomplete'
}

export function planStatusTone(status: StudentPaymentPlanStatus) {
  return status === 'complete' ? ('success' as const) : ('warning' as const)
}

export function termStatusLabel(status: StudentPaymentTermStatus) {
  if (status === 'approved') return 'Approved'
  if (status === 'pending') return 'Pending'
  return 'Void'
}

export function termStatusTone(status: StudentPaymentTermStatus) {
  if (status === 'approved') return 'success' as const
  if (status === 'pending') return 'info' as const
  return 'danger' as const
}

export function summarizeTerms(terms: StudentPaymentTerm[]) {
  const approved = terms.filter((term) => term.status === 'approved').length
  const pending = terms.filter((term) => term.status === 'pending').length
  const parts: string[] = []

  if (approved) {
    parts.push(`${approved} approved`)
  }
  if (pending) {
    parts.push(`${pending} pending`)
  }

  const remainder = terms.length - approved - pending
  if (remainder > 0) {
    parts.push(`${remainder} void`)
  }

  if (parts.length === 0) {
    return 'No installments'
  }

  return `${terms.length} installment${terms.length === 1 ? '' : 's'} · ${parts.join(' · ')}`
}

export function firstProofUrl(terms: StudentPaymentTerm[]) {
  for (const term of terms) {
    const url = term.attachments.find((item) => item.fileUrl)?.fileUrl
    if (url) return url
  }
  return null
}

export function proofCount(terms: StudentPaymentTerm[]) {
  return terms.reduce((sum, term) => sum + term.attachments.length, 0)
}

export function createTermFormKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `term-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

/**
 * Match a form installment to a server term when ids are not yet known.
 * Mutates `unmatched` by removing the chosen term so each server row is used once.
 * Prefer this over array-index matching — form order is authoritative; API terms
 * are returned in stable creation order (`id`).
 */
export function takeMatchingServerTermId(
  formTerm: StudentPaymentTermFormValues,
  unmatched: Array<Pick<
    StudentPaymentTerm,
    'id' | 'amount' | 'paymentDate' | 'status' | 'description' | 'branchId'
  >>,
): string | undefined {
  if (unmatched.length === 0) return undefined

  const amount = parseCurrencyValue(formTerm.amount)
  const description = formTerm.description.trim()
  const branchId = formTerm.branchId || null

  const exactIdx = unmatched.findIndex(
    (term) =>
      term.amount === amount &&
      term.paymentDate === formTerm.paymentDate &&
      term.status === formTerm.status &&
      (term.description || '') === description &&
      (term.branchId ?? null) === branchId,
  )
  if (exactIdx >= 0) {
    return unmatched.splice(exactIdx, 1)[0]?.id
  }

  const softIdx = unmatched.findIndex(
    (term) =>
      term.amount === amount &&
      term.paymentDate === formTerm.paymentDate &&
      term.status === formTerm.status,
  )
  if (softIdx >= 0) {
    return unmatched.splice(softIdx, 1)[0]?.id
  }

  return unmatched.shift()?.id
}

export function todayIsoDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Move an ISO date by whole months, clamping to the last day of the target month. */
export function shiftIsoDate(isoDate: string, months: number) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!match || months === 0) return isoDate
  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const target = new Date(year, monthIndex + months, 1)
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate()
  const clamped = new Date(
    target.getFullYear(),
    target.getMonth(),
    Math.min(day, lastDay),
  )
  const nextYear = clamped.getFullYear()
  const nextMonth = String(clamped.getMonth() + 1).padStart(2, '0')
  const nextDay = String(clamped.getDate()).padStart(2, '0')
  return `${nextYear}-${nextMonth}-${nextDay}`
}

/** Split a whole-rupiah total into `parts`, putting any remainder on the last share. */
export function splitCurrencyAmount(total: number, parts: number) {
  const count = Math.floor(parts)
  if (count < 1 || total <= 0) return []
  const base = Math.floor(total / count)
  const amounts = Array.from({ length: count }, () => base)
  amounts[count - 1] = total - base * (count - 1)
  return amounts
}

/** Planned amount minus non-void installment amounts. Negative means the schedule is over. */
export function unallocatedPlanAmount(
  plannedAmount: string | number,
  terms: Array<{ status: StudentPaymentTermStatus; amount: string | number }>,
) {
  const planned =
    typeof plannedAmount === 'number'
      ? plannedAmount
      : parseCurrencyValue(plannedAmount)
  let scheduled = 0
  for (const term of terms) {
    if (term.status === 'void') continue
    scheduled +=
      typeof term.amount === 'number'
        ? term.amount
        : parseCurrencyValue(term.amount)
  }
  return planned - scheduled
}

export function emptyTermFormValues(
  status: StudentPaymentTermStatus = 'pending',
  branchId = '',
) {
  return {
    key: createTermFormKey(),
    amount: '',
    status,
    description: '',
    paymentDate: todayIsoDate(),
    branchId,
  }
}

export function summarizePaymentBranches(
  terms: Array<{ branchId: string | null; branch: string }>,
) {
  const seen = new Map<string, string>()
  for (const term of terms) {
    if (!term.branchId && !term.branch) continue
    const key = term.branchId ?? term.branch
    if (!seen.has(key)) {
      seen.set(key, term.branch || '—')
    }
  }
  const names = [...seen.values()].filter(Boolean)
  const ids = [...seen.keys()].filter((key) => /^\d+$/.test(key))
  return {
    branch: names.length > 0 ? names.join(', ') : '—',
    branchId: ids.length === 1 ? ids[0]! : null,
  }
}

export function summarizeCollection(
  planned: number,
  terms: Array<{ status: StudentPaymentTermStatus; amount: number }>,
): PaymentCollectionSummary {
  let approved = 0
  let pending = 0
  let voided = 0
  let approvedCount = 0
  let pendingCount = 0
  let voidCount = 0

  for (const term of terms) {
    if (term.status === 'approved') {
      approved += term.amount
      approvedCount += 1
    } else if (term.status === 'pending') {
      pending += term.amount
      pendingCount += 1
    } else {
      voided += term.amount
      voidCount += 1
    }
  }

  const remaining = planned - approved
  const percent =
    planned > 0 ? Math.min(Math.round((approved / planned) * 100), 100) : 0

  return {
    planned,
    approved,
    pending,
    voided,
    remaining,
    percent,
    approvedCount,
    pendingCount,
    voidCount,
  }
}

export function summarizeFormCollection(
  plannedAmount: string,
  terms: StudentPaymentTermFormValues[],
) {
  return summarizeCollection(
    parseCurrencyValue(plannedAmount),
    terms.map((term) => ({
      status: term.status,
      amount: parseCurrencyValue(term.amount),
    })),
  )
}

/**
 * Max amount allowed for an installment so it does not exceed plan remaining.
 * Remaining follows the UI definition: planned − approved (excluding the row
 * being edited when that row is already approved).
 * Void installments are not capped.
 */
export function installmentAmountCap(options: {
  plannedAmount: string | number
  terms: Array<{
    key?: string
    id?: string
    status: StudentPaymentTermStatus
    amount: string | number
  }>
  editingKey?: string | null
  editingId?: string | null
  nextStatus: StudentPaymentTermStatus
  /** When true, a zero plan balance rejects any positive installment. */
  zeroIsCapped?: boolean
}): number | null {
  if (options.nextStatus === 'void') {
    return null
  }

  const planned =
    typeof options.plannedAmount === 'number'
      ? options.plannedAmount
      : parseCurrencyValue(options.plannedAmount)
  if (planned < 0) {
    return null
  }
  if (planned === 0) {
    return options.zeroIsCapped ? 0 : null
  }

  let approvedOthers = 0
  for (const term of options.terms) {
    if (term.status !== 'approved') continue
    const isEditing =
      (options.editingKey != null && term.key === options.editingKey) ||
      (options.editingId != null && term.id === options.editingId)
    if (isEditing) continue
    approvedOthers +=
      typeof term.amount === 'number'
        ? term.amount
        : parseCurrencyValue(term.amount)
  }

  return Math.max(0, planned - approvedOthers)
}

export function installmentExceedsRemaining(options: {
  plannedAmount: string | number
  terms: Array<{
    key?: string
    id?: string
    status: StudentPaymentTermStatus
    amount: string | number
  }>
  editingKey?: string | null
  editingId?: string | null
  nextStatus: StudentPaymentTermStatus
  nextAmount: string | number
  zeroIsCapped?: boolean
}): boolean {
  const cap = installmentAmountCap(options)
  if (cap == null) return false
  const amount =
    typeof options.nextAmount === 'number'
      ? options.nextAmount
      : parseCurrencyValue(options.nextAmount)
  return amount > cap
}

export function planAmountDue(
  fullAmount: number,
  discountAmount: number,
  pretestCredit: number,
) {
  const full = Math.max(0, fullAmount)
  const discount = Math.min(Math.max(0, discountAmount), full)
  const credit = Math.max(0, pretestCredit)
  return Math.max(0, full - discount - credit)
}

export function livePlanStatus(
  amountDue: number,
  approved: number,
  courseFee = amountDue,
): StudentPaymentPlanStatus {
  if (courseFee > 0 && approved >= amountDue) return 'complete'
  return 'incomplete'
}

export function remainingLabel(remaining: number) {
  if (remaining > 0) {
    return 'Remaining'
  }
  if (remaining < 0) {
    return 'Over plan'
  }
  return 'Plan covered'
}

export function paymentSearchHaystack(row: StudentPaymentListItem) {
  return [row.studentPin, row.studentName].join(' ').toLowerCase()
}
