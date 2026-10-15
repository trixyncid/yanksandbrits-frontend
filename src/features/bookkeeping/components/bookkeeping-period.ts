import type { BookkeepingListItem } from '../types/bookkeeping'

export const OPEN_BOOKKEEPING_PERIOD = 'open' as const

export type BookkeepingPeriodValue = typeof OPEN_BOOKKEEPING_PERIOD | string

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
