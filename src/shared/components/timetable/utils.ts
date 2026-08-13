import type { TimetableEvent, TimetableTone } from './types'

export function buildHourRange(startHour: number, endHour: number) {
  if (endHour <= startHour) {
    throw new Error('endHour must be greater than startHour')
  }

  return Array.from({ length: endHour - startHour }, (_, index) => startHour + index)
}

export function formatHourLabel(hour: number) {
  const totalMinutes = Math.round(hour * 60)
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const hour24 = Math.floor(normalized / 60)
  const minutes = normalized % 60
  const period = hour24 < 12 ? 'AM' : 'PM'
  const hour12 = hour24 % 12 || 12

  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`
}

/** Compact range for event cards, e.g. "10:30–11:30 AM". */
export function formatHourRange(startHour: number, durationHours: number) {
  const endHour = startHour + durationHours
  const start = formatHourLabel(startHour)
  const end = formatHourLabel(endHour)
  const startPeriod = start.slice(-2)
  const endPeriod = end.slice(-2)

  if (startPeriod === endPeriod) {
    return `${start.slice(0, -3)}–${end}`
  }

  return `${start}–${end}`
}

export function getEventTop(startHour: number, rangeStartHour: number, rowHeight: number) {
  return (startHour - rangeStartHour) * rowHeight
}

export function getEventHeight(durationHours: number, rowHeight: number) {
  return Math.max(durationHours, 1) * rowHeight
}

export function groupEventsByColumn(events: TimetableEvent[]) {
  return events.reduce<Record<string, TimetableEvent[]>>((acc, event) => {
    if (!acc[event.columnId]) {
      acc[event.columnId] = []
    }

    acc[event.columnId].push(event)
    return acc
  }, {})
}

/** Status badge tones (ongoing / finished / cancelled). Card body uses program colors. */
export const timetableToneClasses: Record<TimetableTone, string> = {
  blue: 'border-[#4274B9]/45 bg-[#EDF4FF] text-[#1E3A5F]',
  green: 'border-[#3D9B6E]/45 bg-[#E8F7EF] text-[#1F5A3D]',
  amber: 'border-[#C9952A]/45 bg-[#FBF3E0] text-[#6B4E12]',
  violet: 'border-[#5B6FA8]/40 bg-[#EEF1F8] text-[#2F3A66]',
  rose: 'border-[#C45B6E]/45 bg-[#FCEEF1] text-[#6E2433]',
}

export const timetableStatusBadgeClasses: Record<TimetableTone, string> = {
  blue: 'bg-[#4274B9] text-white',
  green: 'bg-[#3D9B6E] text-white',
  amber: 'bg-[#C9952A] text-white',
  violet: 'bg-[#5B6FA8] text-white',
  rose: 'bg-[#C45B6E] text-white',
}

export function toneFromScheduleStatus(status: string | null | undefined): TimetableTone {
  const normalized = (status ?? '').toLowerCase()
  if (
    normalized === '2_fn' ||
    normalized === 'finished' ||
    normalized === 'fn'
  ) {
    return 'green'
  }
  if (
    normalized === '3_cn' ||
    normalized === 'cancelled' ||
    normalized === 'canceled' ||
    normalized === 'cn'
  ) {
    return 'rose'
  }
  return 'blue'
}
