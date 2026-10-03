import { format } from 'date-fns'
import { Check, Play } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '../../../shared/lib/cn'
import {
  buildTutorTimeMarkers,
  formatHourPill,
  formatTutorHoursLabel,
  getTutorDayHours,
  type TutorDaySession,
} from '../lib/map-tutor-day-sessions'

type TutorDayTimelineProps = {
  sessions: TutorDaySession[]
  selectedDate: Date
  onSessionClick?: (session: TutorDaySession) => void
  /** Hide the mobile session list when a sibling list already shows the day. */
  hideMobileList?: boolean
  /** Hide the built-in title when a parent panel already labels the section. */
  hideHeader?: boolean
  className?: string
}

/** Horizontal inset so first/last pills are not clipped by -translate-x-1/2. */
const RAIL_INSET_PERCENT = 5

function jakartaNowParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0')

  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    hourFraction: get('hour') + get('minute') / 60,
  }
}

function isSelectedJakartaToday(selectedDate: Date, now = new Date()) {
  const jakarta = jakartaNowParts(now)
  const selectedKey = format(selectedDate, 'yyyy-MM-dd')
  const jakartaKey = `${jakarta.year}-${String(jakarta.month).padStart(2, '0')}-${String(jakarta.day).padStart(2, '0')}`
  return selectedKey === jakartaKey
}

function useJakartaNow(enabled: boolean) {
  const [now, setNow] = useState(() => jakartaNowParts())

  useEffect(() => {
    if (!enabled) return

    setNow(jakartaNowParts())
    const intervalId = window.setInterval(() => {
      setNow(jakartaNowParts())
    }, 30_000)

    return () => window.clearInterval(intervalId)
  }, [enabled])

  return now
}

export function TutorDayTimeline({
  sessions,
  selectedDate,
  onSessionClick,
  hideMobileList = false,
  hideHeader = false,
  className,
}: TutorDayTimelineProps) {
  const viewingToday = isSelectedJakartaToday(selectedDate)
  const now = useJakartaNow(viewingToday)
  const nowHour = now.hourFraction
  const { startHour, endHour } = useMemo(
    () => getTutorDayHours(selectedDate),
    [selectedDate],
  )
  const markers = useMemo(
    () => buildTutorTimeMarkers(selectedDate),
    [selectedDate],
  )
  const daySpan = endHour - startHour || 1
  const hoursLabel = formatTutorHoursLabel(selectedDate)
  const isSaturday = selectedDate.getDay() === 6
  const nowWithinHours =
    viewingToday && nowHour >= startHour && nowHour <= endHour

  const defaultActive = useMemo(() => {
    if (viewingToday) {
      return Math.min(Math.max(Math.round(nowHour), startHour), endHour)
    }
    const firstSessionHour = sessions[0]
      ? Math.round(sessions[0].startHour)
      : startHour
    return Math.min(Math.max(firstSessionHour, startHour), endHour)
  }, [sessions, viewingToday, nowHour, startHour, endHour])

  const [activeHour, setActiveHour] = useState<number | null>(defaultActive)
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useEffect(() => {
    setActiveHour(defaultActive)
  }, [defaultActive])

  function positionPercent(hour: number) {
    const raw = ((hour - startHour) / daySpan) * 100
    const clamped = Math.min(Math.max(raw, 0), 100)
    const usable = 100 - RAIL_INSET_PERCENT * 2
    return RAIL_INSET_PERCENT + (clamped / 100) * usable
  }

  function focusSessionsNear(hour: number) {
    setActiveHour(hour)
    const target =
      sessions.find((session) => Math.abs(session.startHour - hour) < 0.5) ??
      sessions.find((session) => Math.abs(session.startHour - hour) < 1)
    if (!target) return
    cardRefs.current.get(target.id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }

  const cardStepRem = 2.85
  const desktopHeight = Math.max(
    11,
    3.75 + Math.max(sessions.length, 1) * cardStepRem,
  )
  const minRailWidth = Math.max(40, markers.length * 4.25)
  const nowLeft = positionPercent(nowHour)
  const nowLabel = formatHourPill(nowHour)

  return (
    <div className={cn('space-y-3', className)}>
      {hideHeader ? null : (
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold tracking-tight text-slate-900">
              Day timeline
            </h3>
            <p className="mt-0.5 text-sm text-slate-400">
              {format(selectedDate, 'EEEE, d MMM')}
              <span className="mx-1.5 text-slate-300">·</span>
              {hoursLabel}
              {isSaturday ? (
                <span className="ml-1.5 text-xs font-medium text-[#253CA1]">
                  Saturday hours
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {viewingToday ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EEFF] px-2.5 py-1 text-[11px] font-semibold text-[#253CA1]">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#253CA1] opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#253CA1]" />
                </span>
                Now {nowLabel}
              </span>
            ) : null}
            <p className="text-xs font-semibold tabular-nums text-slate-500">
              {sessions.length} session{sessions.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      )}

      {hideHeader && viewingToday ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EEFF] px-2.5 py-1 text-[11px] font-semibold text-[#253CA1]">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#253CA1] opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#253CA1]" />
            </span>
            Now {nowLabel}
          </span>
        </div>
      ) : null}

      <div className="overflow-x-auto pb-1">
        <div
          className="relative hidden px-3 md:block"
          style={{
            minWidth: `${minRailWidth}rem`,
            height: `${desktopHeight}rem`,
          }}
        >
          {markers.map((marker) => {
            const left = positionPercent(marker)
            const active = activeHour != null && activeHour === marker
            return (
              <div
                key={`guide-${marker}`}
                className="absolute top-10 bottom-1"
                style={{ left: `${left}%` }}
              >
                <div
                  className={cn(
                    'absolute top-0 bottom-0 border-l border-dashed',
                    active ? 'border-[#253CA1]/40' : 'border-slate-200',
                  )}
                />
              </div>
            )
          })}

          {nowWithinHours ? (
            <div
              className="pointer-events-none absolute top-0 bottom-1 z-30"
              style={{ left: `${nowLeft}%` }}
              aria-hidden
            >
              <div className="absolute top-8 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#253CA1] px-2 py-0.5 text-[10px] font-bold tracking-wide whitespace-nowrap text-white shadow-md shadow-[#253CA1]/30">
                Now · {nowLabel}
              </div>
              <div className="absolute top-10 bottom-0 left-1/2 w-px -translate-x-1/2 bg-[#253CA1]" />
              <div className="absolute top-10 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#253CA1] ring-2 ring-white" />
              <div className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#253CA1]" />
            </div>
          ) : null}

          {markers.map((marker) => {
            const left = positionPercent(marker)
            const active = activeHour != null && activeHour === marker
            const isNowHour =
              viewingToday && Math.floor(nowHour) === marker && nowWithinHours
            return (
              <button
                key={`pill-${marker}`}
                type="button"
                onClick={() => focusSessionsNear(marker)}
                className={cn(
                  'absolute top-0 z-20 -translate-x-1/2 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap tabular-nums transition sm:px-3 sm:text-xs',
                  active
                    ? 'bg-[#253CA1] text-white shadow-md shadow-[#253CA1]/25'
                    : isNowHour
                      ? 'bg-[#E8EEFF] text-[#253CA1] ring-1 ring-[#C8D4F5]'
                      : 'bg-slate-100 text-slate-600 hover:bg-[#E8EEFF] hover:text-[#253CA1]',
                )}
                style={{ left: `${left}%` }}
              >
                {formatHourPill(marker)}
              </button>
            )
          })}

          {sessions.map((session, index) => {
            const left = positionPercent(session.startHour)
            const right = positionPercent(
              Math.max(session.endHour, session.startHour + 0.5),
            )
            const width = Math.max(
              right - left,
              (0.75 / daySpan) * (100 - RAIL_INSET_PERCENT * 2),
            )
            const top = 3.5 + index * cardStepRem
            const isActive =
              activeHour != null &&
              Math.abs(activeHour - session.startHour) < 0.75
            const isCurrent =
              viewingToday &&
              nowHour >= session.startHour &&
              nowHour < session.endHour

            return (
              <button
                key={session.id}
                type="button"
                ref={(node) => {
                  if (node) cardRefs.current.set(session.id, node)
                  else cardRefs.current.delete(session.id)
                }}
                onClick={() => onSessionClick?.(session)}
                className={cn(
                  'absolute z-10 flex items-center overflow-visible rounded-xl border border-white/70 py-1.5 pr-2.5 pl-3.5 text-left shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition',
                  'hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(15,23,42,0.1)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#253CA1]/35',
                  session.status === 'cancelled' && 'opacity-70',
                  isActive && 'ring-2 ring-[#253CA1]/20',
                )}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  top: `${top}rem`,
                  minHeight: '2.4rem',
                  backgroundColor: session.backgroundColor,
                  color: session.textColor,
                  borderLeftWidth: 3,
                  borderLeftColor: session.textColor,
                }}
              >
                <StatusBadge session={session} isCurrent={isCurrent} />
                <SessionCardBody
                  session={session}
                  showNowCue={isCurrent}
                  compact
                />
              </button>
            )
          })}
        </div>
      </div>

      <div className="md:hidden">
        <div
          className={cn(
            'flex gap-2 overflow-x-auto px-1 pb-1',
            !hideMobileList && 'mb-3',
          )}
        >
          {nowWithinHours ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#253CA1] px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-white" />
              </span>
              Now {nowLabel}
            </span>
          ) : null}
          {markers.map((marker) => {
            const active = activeHour != null && activeHour === marker
            const isNowHour =
              viewingToday && Math.floor(nowHour) === marker && nowWithinHours
            return (
              <button
                key={`mobile-pill-${marker}`}
                type="button"
                onClick={() => focusSessionsNear(marker)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold tabular-nums transition',
                  active
                    ? 'bg-[#253CA1] text-white shadow-md shadow-[#253CA1]/25'
                    : isNowHour
                      ? 'bg-[#E8EEFF] text-[#253CA1]'
                      : 'bg-slate-100 text-slate-600',
                )}
              >
                {formatHourPill(marker)}
              </button>
            )
          })}
        </div>

        {hideMobileList ? (
          sessions.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              No sessions on the timeline for this day.
            </p>
          ) : (
            <p className="pt-1 text-xs text-slate-400">
              {sessions.length} block{sessions.length === 1 ? '' : 's'} on the
              day graph · open a class card above for details
            </p>
          )
        ) : (
          <ul className="space-y-2">
            {sessions.map((session) => {
              const isCurrent =
                viewingToday &&
                nowHour >= session.startHour &&
                nowHour < session.endHour
              return (
                <li key={session.id}>
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) cardRefs.current.set(session.id, node)
                      else cardRefs.current.delete(session.id)
                    }}
                    onClick={() => onSessionClick?.(session)}
                    className={cn(
                      'relative flex w-full items-center overflow-visible rounded-xl border border-slate-100 py-2 pr-2.5 pl-3.5 text-left shadow-sm transition',
                      'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#253CA1]/35',
                      session.status === 'cancelled' && 'opacity-70',
                    )}
                    style={{
                      backgroundColor: session.backgroundColor,
                      color: session.textColor,
                      borderLeftWidth: 3,
                      borderLeftColor: session.textColor,
                    }}
                  >
                    <StatusBadge session={session} isCurrent={isCurrent} />
                    <SessionCardBody
                      session={session}
                      showNowCue={isCurrent}
                      compact
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function StatusBadge({
  session,
  isCurrent,
}: {
  session: TutorDaySession
  isCurrent: boolean
}) {
  const tone =
    session.status === 'finished'
      ? {
          className: 'bg-[#3D9B6E] text-white ring-white',
          icon: <Check className="size-2.5" strokeWidth={3} />,
        }
      : session.status === 'cancelled'
        ? {
            className: 'bg-[#C45B6E] text-white ring-white',
            icon: <span className="text-[8px] font-bold leading-none">×</span>,
          }
        : isCurrent
          ? {
              className: 'bg-[#253CA1] text-white ring-white',
              icon: <Play className="size-2.5 fill-current" />,
            }
          : {
              className: 'bg-white text-[#253CA1] ring-[#253CA1]/25',
              icon: <Play className="size-2 fill-current" />,
            }

  return (
    <span
      className={cn(
        'absolute -top-1.5 -left-1.5 z-20 inline-flex size-4 items-center justify-center rounded-full shadow-sm ring-2',
        tone.className,
      )}
      aria-hidden
    >
      {tone.icon}
    </span>
  )
}

function SessionCardBody({
  session,
  showNowCue,
  compact = false,
}: {
  session: TutorDaySession
  showNowCue: boolean
  compact?: boolean
}) {
  if (compact) {
    return (
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[13px] leading-tight font-bold tracking-tight">
            {session.title}
          </p>
          {showNowCue ? (
            <Play className="size-3 shrink-0 fill-current opacity-70" />
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-[11px] leading-tight font-medium opacity-80">
          <span className="tabular-nums">
            {session.startTimeLabel}
            <span className="mx-0.5 opacity-40">–</span>
            {session.endTimeLabel}
          </span>
          <span className="mx-1 opacity-40">·</span>
          {session.subtitle}
          <span className="mx-1 opacity-40">·</span>
          {session.classroom}
          {session.status === 'cancelled' ? (
            <span className="opacity-80"> · Cancelled</span>
          ) : null}
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-bold tracking-tight">
          {session.title}
        </p>
        {showNowCue ? (
          <Play className="size-3.5 shrink-0 fill-current opacity-70" />
        ) : null}
      </div>
      <p className="mt-0.5 truncate text-xs font-medium opacity-75">
        {session.subtitle}
      </p>
      <p className="mt-2 text-xs font-semibold tabular-nums opacity-80">
        {session.startTimeLabel}
        <span className="mx-1 opacity-40">–</span>
        {session.endTimeLabel}
      </p>
      <p className="mt-0.5 truncate text-[11px] opacity-60">
        {session.classroom}
        {session.status === 'cancelled' ? ' · Cancelled' : null}
      </p>
    </div>
  )
}
