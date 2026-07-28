import { cn } from '../../lib/cn'
import { TimetableClassroomColumn } from './timetable-classroom-column'
import { TimetableTimeColumn } from './timetable-time-column'
import type { ClassroomTimetableProps } from './types'
import { buildHourRange, groupEventsByColumn } from './utils'

/** Inclusive display range: 8:00 AM through 8:00 PM */
const DEFAULT_START_HOUR = 8
const DEFAULT_END_HOUR = 21
const DEFAULT_ROW_HEIGHT = 88
const DEFAULT_COLUMN_WIDTH = 210
const DEFAULT_TIME_COLUMN_WIDTH = 84
const DEFAULT_MAX_HEIGHT = '70vh'
const HEADER_HEIGHT = 48

export function ClassroomTimetable({
  columns,
  events,
  startHour = DEFAULT_START_HOUR,
  endHour = DEFAULT_END_HOUR,
  rowHeight = DEFAULT_ROW_HEIGHT,
  columnWidth = DEFAULT_COLUMN_WIDTH,
  timeColumnWidth = DEFAULT_TIME_COLUMN_WIDTH,
  maxHeight = DEFAULT_MAX_HEIGHT,
  onEventClick,
  onSlotClick,
  className,
}: ClassroomTimetableProps) {
  const hours = buildHourRange(startHour, endHour)
  const eventsByColumn = groupEventsByColumn(events)

  return (
    <div
      className={cn(
        'overflow-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-sm',
        className,
      )}
      style={{ maxHeight }}
    >
      <div className="flex min-w-max">
        <TimetableTimeColumn
          hours={hours}
          width={timeColumnWidth}
          headerHeight={HEADER_HEIGHT}
          rowHeight={rowHeight}
        />

        <div className="flex">
          {columns.map((column, index) => (
            <TimetableClassroomColumn
              key={column.id}
              column={column}
              hours={hours}
              events={eventsByColumn[column.id] ?? []}
              width={columnWidth}
              headerHeight={HEADER_HEIGHT}
              rowHeight={rowHeight}
              rangeStartHour={startHour}
              isLast={index === columns.length - 1}
              onEventClick={onEventClick}
              onSlotClick={onSlotClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
