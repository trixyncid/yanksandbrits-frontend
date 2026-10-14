import { CalendarDays } from 'lucide-react'

import { cn } from '../../../shared/lib/cn'
import { DropdownSelect } from '../../../shared/components/ui/dropdown-select'
import { Select } from '../../../shared/components/ui/select'
import type { BookkeepingListItem } from '../types/bookkeeping'

export const OPEN_BOOKKEEPING_PERIOD = 'open' as const

export type BookkeepingPeriodValue = typeof OPEN_BOOKKEEPING_PERIOD | string

type BookkeepingPeriodSelectProps = {
  value: BookkeepingPeriodValue
  periods: BookkeepingListItem[]
  openPeriodLabel?: string
  disabled?: boolean
  /** `pill` matches Steadi-style period chips (calendar + rounded capsule). */
  variant?: 'default' | 'pill'
  className?: string
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

function PillPeriodSelect({
  value,
  periods,
  openPeriodLabel,
  disabled,
  className,
  onChange,
}: Omit<BookkeepingPeriodSelectProps, 'variant'> & {
  openPeriodLabel: string
}) {
  return (
    <DropdownSelect
      variant="pill"
      leadingIcon={CalendarDays}
      ariaLabel="Bookkeeping period"
      value={value}
      disabled={disabled}
      align="end"
      className={cn('max-w-[min(100vw-2rem,20rem)]', className)}
      options={[
        { value: OPEN_BOOKKEEPING_PERIOD, label: openPeriodLabel },
        ...periods.map((period) => ({
          value: period.id,
          label: formatBookkeepingPeriodOption(period),
        })),
      ]}
      onValueChange={(next) => onChange(next as BookkeepingPeriodValue)}
    />
  )
}

export function BookkeepingPeriodSelect({
  value,
  periods,
  openPeriodLabel = 'Open period (after latest bookkeeping → today)',
  disabled = false,
  variant = 'default',
  className,
  onChange,
}: BookkeepingPeriodSelectProps) {
  if (variant === 'pill') {
    return (
      <PillPeriodSelect
        value={value}
        periods={periods}
        openPeriodLabel={openPeriodLabel}
        disabled={disabled}
        className={className}
        onChange={onChange}
      />
    )
  }

  return (
    <Select
      aria-label="Bookkeeping period"
      value={value}
      disabled={disabled}
      containerClassName={cn('min-w-64 sm:min-w-80', className)}
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
