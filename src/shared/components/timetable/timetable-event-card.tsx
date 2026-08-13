import { cn } from '../../lib/cn'
import type { TimetableEvent } from './types'
import {
  formatHourRange,
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

function withAlpha(hex: string, alphaHex: string) {
  const normalized = hex.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return `${normalized}${alphaHex}`
  }
  return normalized
}

export function TimetableEventCard({
  event,
  rangeStartHour,
  rowHeight,
  onClick,
}: TimetableEventCardProps) {
  const top = getEventTop(event.startHour, rangeStartHour, rowHeight)
  const height = getEventHeight(event.durationHours, rowHeight)
  const hasProgramColors = Boolean(event.backgroundColor && event.textColor)
  const timeLabel = formatHourRange(event.startHour, event.durationHours)

  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      className={cn(
        'absolute inset-x-1.5 z-10 flex min-h-0 flex-col overflow-hidden rounded-xl border px-2 py-1.5 text-left shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4274B9]/40',
        !hasProgramColors && timetableToneClasses[event.tone],
      )}
      style={{
        top: top + 4,
        height: height - 8,
        ...(hasProgramColors
          ? {
              backgroundColor: event.backgroundColor,
              color: event.textColor,
              borderColor: withAlpha(event.textColor!, '40'),
            }
          : undefined),
      }}
    >
      <p className="min-w-0 truncate text-[11px] font-bold leading-tight">
        {event.title}
      </p>
      <p className="mt-0.5 min-w-0 line-clamp-2 text-[10px] font-medium leading-tight opacity-85">
        {event.subtitle}
      </p>
      {event.meta ? (
        <p className="mt-0.5 min-w-0 truncate text-[9px] font-medium leading-tight opacity-70">
          {event.meta}
        </p>
      ) : null}
      <div className="mt-auto flex min-w-0 items-center gap-1 pt-1">
        <span className="min-w-0 flex-1 truncate text-[10px] font-semibold tabular-nums opacity-80">
          {timeLabel}
        </span>
        {event.status ? (
          <span
            className={cn(
              'inline-flex shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide',
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
