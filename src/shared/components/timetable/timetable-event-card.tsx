import { cn } from '../../lib/cn'
import type { TimetableEvent } from './types'
import {
  formatHourLabel,
  getEventHeight,
  getEventTop,
  timetableStatusBadgeClasses,
  timetableToneClasses,
} from './utils'

type TimetableEventCardProps = {
  event: TimetableEvent
  rangeStartHour: number
  rowHeight: number
  onClick?: (event: TimetableEvent) => void
}

export function TimetableEventCard({
  event,
  rangeStartHour,
  rowHeight,
  onClick,
}: TimetableEventCardProps) {
  const top = getEventTop(event.startHour, rangeStartHour, rowHeight)
  const height = getEventHeight(event.durationHours, rowHeight)

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className={cn(
        'absolute inset-x-1.5 z-10 overflow-hidden rounded-xl border px-2.5 py-2 text-left shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4274B9]/40',
        timetableToneClasses[event.tone],
      )}
      style={{
        top: top + 4,
        height: height - 8,
      }}
    >
      <p className="truncate text-[11px] font-bold leading-4">{event.title}</p>
      <p className="mt-0.5 overflow-hidden text-[10px] font-medium leading-4 opacity-85">
        {event.subtitle}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold opacity-75">
          {formatHourLabel(event.startHour)}
          {event.meta ? ` • ${event.meta}` : ''}
        </span>
        {event.status ? (
          <span
            className={cn(
              'inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide',
              timetableStatusBadgeClasses[event.tone],
            )}
          >
            {event.status}
          </span>
        ) : null}
      </div>
    </button>
  )
}
