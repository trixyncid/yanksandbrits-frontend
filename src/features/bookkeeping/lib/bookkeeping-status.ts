import type { PillTone } from '../../student-payments/lib/payment-ui'
import type { BookkeepingStatus } from '../types/bookkeeping'

export function bookkeepingStatusLabel(status: BookkeepingStatus) {
  if (status === 'approved') return 'Approved'
  if (status === 'pending') return 'Pending'
  return 'Void'
}

export function bookkeepingStatusTone(status: BookkeepingStatus): PillTone {
  if (status === 'approved') return 'success'
  if (status === 'pending') return 'brand'
  return 'danger'
}

export function formatPeriodDate(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatPeriodDateTime(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

/** Whole days covered by the period, counting both ends. */
export function periodLengthDays(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return null
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1)
}
