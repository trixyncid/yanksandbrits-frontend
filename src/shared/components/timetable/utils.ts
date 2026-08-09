import type { TimetableEvent, TimetableTone } from './types'

export function buildHourRange(startHour: number, endHour: number) {
  if (endHour <= startHour) {
    throw new Error('endHour must be greater than startHour')
  }

  return Array.from({ length: endHour - startHour }, (_, index) => startHour + index)
}

export function formatHourLabel(hour: number) {
  const value = hour % 12 || 12
  const period = hour < 12 || hour === 24 ? 'AM' : 'PM'

  return `${value}:00 ${period}`
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

/** Status-driven tones keep the same meaning across days and classrooms. */
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
