import { format } from 'date-fns'

import { formatCurrencyAmount } from '../../../shared/lib/currency'

export function formatSalaryBreakdownDate(value: string | null) {
  if (!value) {
    return '—'
  }
  return format(new Date(value), 'MMM d, yyyy')
}

export function formatCommissionPercentage(value: number) {
  if (!Number.isFinite(value) || value === 0) {
    return '0%'
  }
  const rounded = Math.round(value * 100) / 100
  return `${rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2)}%`
}

export function formatCommissionTierRange(
  minAmount: number | null,
  maxAmount: number | null,
) {
  if (minAmount == null) {
    return 'No matching tier'
  }
  const minLabel = formatCurrencyAmount(minAmount)
  if (maxAmount == null) {
    return `${minLabel} and above`
  }
  return `${minLabel} – ${formatCurrencyAmount(maxAmount)}`
}

export function periodTypeLabel(periodType: string) {
  if (periodType === '5W') {
    return '5-week period'
  }
  if (periodType === '4W') {
    return '4-week period'
  }
  return periodType
}
