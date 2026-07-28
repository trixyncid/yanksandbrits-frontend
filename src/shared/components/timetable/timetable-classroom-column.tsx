import { cn } from '../../lib/cn'
import { TimetableEventCard } from './timetable-event-card'
import type { TimetableColumn, TimetableEvent } from './types'

type TimetableClassroomColumnProps = {
  column: TimetableColumn
  hours: number[]
  events: TimetableEvent[]
  width: number
  headerHeight: number
  rowHeight: number
  rangeStartHour: number
  isLast: boolean
  onEventClick?: (event: TimetableEvent) => void
  onSlotClick?: (column: TimetableColumn, hour: number) => void
}

export function TimetableClassroomColumn({
  column,
  hours,
  events,
  width,
  headerHeight,
  rowHeight,
  rangeStartHour,
  isLast,
  onEventClick,
  onSlotClick,
}: TimetableClassroomColumnProps) {
  return (
    <div className="relative shrink-0 border-r border-slate-200 last:border-r-0" style={{ width }}>
      <div
        className={cn(
          'sticky top-0 z-20 flex items-center justify-center border-b border-white/20 bg-gradient-to-b from-[#0D66D0] to-[#2E7FE0] px-3 text-center text-xs font-semibold text-white shadow-[0_6px_12px_-8px_rgba(15,23,42,0.45)]',
          isLast ? 'rounded-tr-2xl' : '',
        )}
        style={{ height: headerHeight }}
      >
        {column.label}
      </div>

      <div className="relative bg-white" style={{ height: hours.length * rowHeight }}>
        {hours.map((hour, index) => (
          <button
            key={`${column.id}-${hour}`}
            type="button"
            onClick={() => onSlotClick?.(column, hour)}
            className={cn(
              'absolute inset-x-0 border-t border-slate-200 transition-colors hover:bg-[#F8FBFF]',
              index === hours.length - 1 && isLast ? 'rounded-br-2xl' : '',
            )}
            style={{
              top: index * rowHeight,
              height: rowHeight,
            }}
            aria-label={`Create schedule in ${column.label} at ${hour}:00`}
          />
        ))}

        {events.map((event) => (
          <TimetableEventCard
            key={event.id}
            event={event}
            rangeStartHour={rangeStartHour}
            rowHeight={rowHeight}
            onClick={onEventClick}
          />
        ))}
      </div>
    </div>
  )
}
