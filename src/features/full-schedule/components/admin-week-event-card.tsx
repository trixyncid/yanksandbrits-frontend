import type { CSSProperties } from 'react'

import {
  timetableStatusBadgeClasses,
  timetableToneClasses,
} from '../../../shared/components/timetable/utils'
import { cn } from '../../../shared/lib/cn'
import type { WeekScheduleEvent } from '../../schedules/lib/map-week-schedule-events'

type AdminWeekEventCardProps = {
  event: WeekScheduleEvent
  style?: CSSProperties
  onClick?: () => void
  className?: string
}

function formatSessionDuration(hours: number) {
  const rounded = Math.round(hours * 4) / 4
  const label =
    Number.isInteger(rounded) || Math.abs(rounded % 1) < 0.01
      ? String(Math.round(rounded))
      : String(rounded)
  return `${label} hr${rounded === 1 ? '' : 's'}`
}

export function AdminWeekEventCard({
  event,
  style,
  onClick,
  className,
}: AdminWeekEventCardProps) {
  const interactive = Boolean(onClick)
  const hasProgramColors = Boolean(event.backgroundColor && event.textColor)
  const isCompact = event.durationHours < 1.25
  const showSubtitle = Boolean(event.subtitle) && event.durationHours >= 0.75
  const showStatus = event.durationHours >= 0.9
  const durationLabel = formatSessionDuration(event.durationHours)

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      title={`${event.title} · ${durationLabel} · ${event.startLabel} · ${event.status}${event.tutor ? ` · ${event.tutor}` : ''}${event.classroom ? ` · ${event.classroom}` : ''}`}
      className={cn(
        'absolute flex min-h-0 flex-col overflow-hidden rounded-lg border text-left shadow-sm transition-shadow',
        isCompact ? 'gap-0.5 px-1.5 py-1' : 'gap-0.5 px-2 py-1.5',
        interactive
          ? 'cursor-pointer hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20'
          : 'cursor-default',
        !hasProgramColors && timetableToneClasses[event.tone],
        className,
      )}
      style={{
        ...style,
        ...(hasProgramColors
          ? {
              backgroundColor: event.backgroundColor,
              borderColor: event.borderColor,
              color: event.textColor,
            }
          : undefined),
      }}
    >
      <p
        className={cn(
          'shrink-0 font-bold leading-snug',
          isCompact
            ? 'line-clamp-2 text-[11px]'
            : 'truncate text-[11px] leading-tight',
        )}
      >
        {event.title}
      </p>
      {showSubtitle ? (
        <p
          className={cn(
            'min-h-0 text-[10px] font-medium leading-tight opacity-85',
            isCompact ? 'truncate' : 'line-clamp-2',
          )}
        >
          {event.subtitle}
        </p>
      ) : null}
      <div
        className={cn(
          'mt-auto flex min-w-0 items-center gap-1',
          isCompact ? 'pt-0.5' : 'pt-1',
        )}
      >
        <span className="min-w-0 flex-1 truncate text-[10px] font-semibold tabular-nums opacity-80">
          {durationLabel}
        </span>
        {showStatus ? (
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
