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

/** Inclusive start hour, exclusive end hour. Example: 9 → 11 means 09:00–11:00. */
export type TimetableSlotRange = {
  startHour: number
  endHour: number
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
  /** Fired after click or drag-select across one or more hour slots. */
  onSlotRangeSelect?: (
    column: TimetableColumn,
    range: TimetableSlotRange,
  ) => void
  className?: string
}
