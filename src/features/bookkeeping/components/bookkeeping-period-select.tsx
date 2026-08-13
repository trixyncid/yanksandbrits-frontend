import { Select } from '../../../shared/components/ui/select'
import type { BookkeepingListItem } from '../types/bookkeeping'

export const OPEN_BOOKKEEPING_PERIOD = 'open' as const

export type BookkeepingPeriodValue = typeof OPEN_BOOKKEEPING_PERIOD | string

type BookkeepingPeriodSelectProps = {
  value: BookkeepingPeriodValue
  periods: BookkeepingListItem[]
  openPeriodLabel?: string
  disabled?: boolean
  onChange: (value: BookkeepingPeriodValue) => void
}

function formatDateLabel(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return isoDate
  }
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatBookkeepingPeriodOption(item: BookkeepingListItem) {
  const range = `${formatDateLabel(item.startDate)} – ${formatDateLabel(item.endDate)}`
  const title = item.title.trim()
  const status =
    item.status === 'approved'
      ? ''
      : item.status === 'pending'
        ? ' (Pending)'
        : ' (Void)'
  return title ? `${title} · ${range}${status}` : `${range}${status}`
}

export function BookkeepingPeriodSelect({
  value,
  periods,
  openPeriodLabel = 'Open period (after latest bookkeeping → today)',
  disabled = false,
  onChange,
}: BookkeepingPeriodSelectProps) {
  return (
    <Select
      aria-label="Bookkeeping period"
      value={value}
      disabled={disabled}
      containerClassName="min-w-64 sm:min-w-80"
      onChange={(event) => onChange(event.target.value as BookkeepingPeriodValue)}
    >
      <option value={OPEN_BOOKKEEPING_PERIOD}>{openPeriodLabel}</option>
      {periods.map((period) => (
        <option key={period.id} value={period.id}>
          {formatBookkeepingPeriodOption(period)}
        </option>
      ))}
    </Select>
  )
}
