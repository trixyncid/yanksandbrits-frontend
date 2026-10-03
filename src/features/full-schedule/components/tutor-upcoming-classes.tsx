import { format, isSameDay, parseISO, startOfDay } from 'date-fns'
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Plus,
  XCircle,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../../shared/lib/cn'
import { DashboardPanel } from '../../admin/components/dashboard-section'
import type { TutorDaySession } from '../lib/map-tutor-day-sessions'

type TutorUpcomingClassesProps = {
  sessions: TutorDaySession[]
  selectedDate: Date
  isLoading?: boolean
  isError?: boolean
  onSessionClick?: (session: TutorDaySession) => void
  onViewAll?: () => void
  className?: string
}

function sessionProgressPct(
  session: TutorDaySession,
  nowMs = Date.now(),
): number {
  if (session.status === 'finished') return 100
  if (session.status === 'cancelled') return 0

  const startMs = Date.parse(session.startAt)
  if (Number.isNaN(startMs)) return 0

  const durationHours = Math.max(session.endHour - session.startHour, 0.25)
  const endMs = startMs + durationHours * 3_600_000

  if (nowMs <= startMs) {
    // Upcoming: soft duration fill so rows match Steadi goal bars visually.
    return Math.min(100, Math.round((durationHours / 2) * 55) + 28)
  }
  if (nowMs >= endMs) return 100
  return Math.round(((nowMs - startMs) / (endMs - startMs)) * 100)
}

function sessionIcon(session: TutorDaySession): ReactNode {
  if (session.status === 'finished') {
    return <CheckCircle2 className="size-4" />
  }
  if (session.status === 'cancelled') {
    return <XCircle className="size-4" />
  }
  if (session.status === 'ongoing') {
    return <Clock3 className="size-4" />
  }
  return <BookOpen className="size-4" />
}

function progressBarTone(session: TutorDaySession): string {
  if (session.status === 'cancelled') return 'bg-rose-300/80'
  if (session.status === 'finished') return 'bg-emerald-300/90'
  if (session.status === 'ongoing') return 'bg-[#7B93E8]'
  return 'bg-[#7B93E8]'
}

export function TutorUpcomingClasses({
  sessions,
  selectedDate,
  isLoading,
  isError,
  onSessionClick,
  onViewAll,
  className,
}: TutorUpcomingClassesProps) {
  const today = startOfDay(new Date())
  const selected = startOfDay(selectedDate)
  const viewingToday = isSameDay(selected, today)
  const title = viewingToday ? 'Upcoming classes' : 'Classes'
  const subtitle = viewingToday
    ? 'Next classes from now'
    : `Sessions on ${format(selected, 'EEEE, d MMM')}`

  return (
    <DashboardPanel
      variant="navy"
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 fill-mode-both',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-bold text-white">{title}</p>
          <p className="mt-0.5 text-sm text-white/60">{subtitle}</p>
        </div>
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <Plus className="size-3.5" strokeWidth={2.5} />
            Timeline
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <ul className="mt-6 space-y-5">
          {[0, 1, 2].map((index) => (
            <li key={index} className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="size-8 animate-pulse rounded-xl bg-white/10" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 animate-pulse rounded bg-white/10" />
                    <div className="h-2.5 w-20 animate-pulse rounded bg-white/10" />
                  </div>
                </div>
                <div className="h-3.5 w-14 animate-pulse rounded bg-white/10" />
              </div>
              <div className="h-2 animate-pulse rounded-full bg-white/10" />
            </li>
          ))}
        </ul>
      ) : isError ? (
        <p className="mt-8 text-center text-sm text-rose-200">
          Unable to load classes.
        </p>
      ) : sessions.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center text-sm text-white/55">
          {viewingToday
            ? 'Nothing upcoming right now. Pick a day with session dots on the calendar.'
            : 'No classes on this day. Pick another date on the calendar.'}
        </p>
      ) : (
        <ul className="mt-6 space-y-5">
          {sessions.map((session) => {
            const muted =
              session.status === 'finished' || session.status === 'cancelled'
            const pct = sessionProgressPct(session)
            const sessionDay = session.dateKey
              ? startOfDay(parseISO(session.dateKey))
              : null
            const dayHint =
              viewingToday && sessionDay && !isSameDay(sessionDay, today)
                ? format(sessionDay, 'EEE d')
                : null
            const detailParts = [
              session.classroom,
              session.subtitle,
              dayHint,
            ].filter(Boolean)

            return (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => onSessionClick?.(session)}
                  className={cn(
                    'group w-full text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                    muted && 'opacity-70',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                        {sessionIcon(session)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {session.title}
                        </p>
                        <p className="truncate text-xs text-white/55">
                          {detailParts.join(' · ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <div className="text-right">
                        <p className="text-sm font-bold tabular-nums text-white">
                          {session.startTimeLabel}
                        </p>
                        <p className="text-[11px] font-medium tabular-nums text-white/55">
                          {session.endTimeLabel}
                        </p>
                      </div>
                      <ChevronDown className="size-4 text-white/40 transition group-hover:translate-y-0.5 group-hover:text-white/70" />
                    </div>
                  </div>
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700 ease-out',
                        progressBarTone(session),
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardPanel>
  )
}

/**
 * Selected day → that day's classes.
 * Today → remaining from now (selected day first), then fill from later days
 * in `rangeSessions` up to `limit`.
 */
export function sessionsForUpcomingPanel(
  daySessions: TutorDaySession[],
  selectedDate: Date,
  rangeSessions: TutorDaySession[] = [],
  limit = 5,
  nowIso = new Date().toISOString(),
): TutorDaySession[] {
  const today = startOfDay(new Date())
  const selected = startOfDay(selectedDate)

  if (!isSameDay(selected, today)) {
    return daySessions.slice(0, limit)
  }

  const remainingToday = daySessions.filter(
    (session) =>
      session.status !== 'cancelled' &&
      session.status !== 'finished' &&
      session.startAt >= nowIso,
  )

  if (remainingToday.length >= limit) {
    return remainingToday.slice(0, limit)
  }

  const todayKey = format(today, 'yyyy-MM-dd')
  const later = rangeSessions.filter(
    (session) =>
      session.dateKey > todayKey &&
      session.status !== 'cancelled' &&
      session.status !== 'finished' &&
      session.startAt >= nowIso,
  )

  const merged = [...remainingToday]
  for (const session of later) {
    if (merged.length >= limit) break
    if (merged.some((item) => item.id === session.id)) continue
    merged.push(session)
  }

  if (merged.length > 0) return merged

  return daySessions
    .filter((session) => session.status !== 'cancelled')
    .slice(0, limit)
}
