export type TimetableTone = 'blue' | 'green' | 'amber' | 'violet' | 'rose'

export type TimetableColumn = {
  id: string
  label: string
}

export type TimetableEvent = {
  id: string
  columnId: string
  title: string
  subtitle: string
  startHour: number
  durationHours: number
  tone: TimetableTone
  status?: string
  meta?: string
}

export type ClassroomTimetableProps = {
  columns: TimetableColumn[]
  events: TimetableEvent[]
  startHour?: number
  endHour?: number
  rowHeight?: number
  columnWidth?: number
  timeColumnWidth?: number
  /** Max height of the scroll area. Enables vertical scrolling with sticky headers. */
  maxHeight?: number | string
  onEventClick?: (event: TimetableEvent) => void
  onSlotClick?: (column: TimetableColumn, hour: number) => void
  className?: string
}
