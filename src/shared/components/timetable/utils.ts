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

export const timetableToneClasses: Record<TimetableTone, string> = {
  blue: 'border-[#59C3D4] bg-[#66CBDC] text-[#0E3E4A]',
  green: 'border-[#74D858] bg-[#87ED64] text-[#235313]',
  amber: 'border-[#E8C36A] bg-[#F4D58F] text-[#6E4A00]',
  violet: 'border-[#A892F0] bg-[#B9A4FA] text-[#38225E]',
  rose: 'border-[#F2A0B0] bg-[#F8B4C0] text-[#7A2435]',
}
