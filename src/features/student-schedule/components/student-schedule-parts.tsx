import {
  CalendarPlus,
  CalendarX2,
  ChevronDown,
  DoorOpen,
  GraduationCap,
  RefreshCw,
  UserRound,
  Users,
  UserX,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

import { cn } from '../../../shared/lib/cn'
import {
  DashboardCardHeader,
  DashboardPanel,
} from '../../admin/components/dashboard-section'
import type {
  AttentionItem,
  AttentionKind,
  ScheduleSession,
} from '../api/student-schedule-api'
import { formatTimeRange, type ScheduleBucket } from '../lib/schedule-days'

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

const ATTENTION: Record<
  AttentionKind,
  { icon: LucideIcon; tone: string; describe: (item: AttentionItem) => string }
> = {
  absent: {
    icon: UserX,
    tone: 'bg-rose-50 text-rose-800',
    describe: (item) => `Missed ${plural(item.count ?? 0, 'class')} this week`,
  },
  cancelled: {
    icon: CalendarX2,
    tone: 'bg-amber-50 text-amber-900',
    describe: (item) => `${plural(item.count ?? 0, 'class')} cancelled this week`,
  },
  renewal: {
    icon: RefreshCw,
    tone: 'bg-brand-50 text-brand-800',
    describe: (item) =>
      `${item.used}/${item.total} sessions used${item.program ? ` · ${item.program}` : ''}. Time to talk about renewing`,
  },
  unbooked: {
    icon: CalendarPlus,
    tone: 'bg-canvas text-slate-700',
    describe: () => 'No upcoming class booked',
  },
}

const COLLAPSED_COUNT = 6

export function AttentionStrip({
  items,
  onSelectStudent,
}: {
  items: AttentionItem[]
  onSelectStudent: (studentId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  if (items.length === 0) return null
  const visible = expanded ? items : items.slice(0, COLLAPSED_COUNT)

  return (
    <DashboardPanel variant="plump">
      <DashboardCardHeader
        title={`Needs attention (${items.length})`}
        description="Absences and cancellations in the last 7 days, packages nearly used up, and students with nothing booked. Tap one to see their classes."
      />
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => {
          const config = ATTENTION[item.kind]
          const Icon = config.icon
          return (
            <li key={`${item.studentId}-${item.kind}`}>
              <button
                type="button"
                onClick={() => onSelectStudent(item.studentId)}
                className={cn(
                  'flex w-full items-start gap-2.5 rounded-2xl px-3.5 py-2.5 text-left transition hover:-translate-y-0.5',
                  config.tone,
                )}
              >
                <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{item.studentName}</span>
                  <span className="block text-xs leading-snug opacity-80">
                    {config.describe(item)}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {items.length > COLLAPSED_COUNT ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700"
        >
          {expanded ? 'Show fewer' : `Show all ${items.length}`}
          <ChevronDown className={cn('size-3.5 transition', expanded && 'rotate-180')} />
        </button>
      ) : null}
    </DashboardPanel>
  )
}

const STATUS_STYLES: Record<ScheduleSession['status'], { label: string; className: string }> = {
  ongoing: { label: 'Booked', className: 'bg-brand-50 text-brand-700' },
  finished: { label: 'Finished', className: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-50 text-rose-700' },
}

function Detail({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <Icon aria-hidden className="size-3.5 shrink-0 text-slate-400" />
      <span className="truncate">{children}</span>
    </span>
  )
}

function SessionRow({ session }: { session: ScheduleSession }) {
  const status = STATUS_STYLES[session.status]
  const isGroup = session.kind === 'group'
  return (
    <li
      className={cn(
        'flex flex-col gap-2 rounded-3xl bg-canvas/70 px-4 py-3 sm:flex-row sm:items-center sm:gap-4',
        session.status === 'cancelled' && 'opacity-70',
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 sm:w-32 sm:flex-col sm:items-start">
        <p
          className={cn(
            'text-sm font-bold text-ink tabular-nums',
            session.status === 'cancelled' && 'line-through',
          )}
        >
          {formatTimeRange(session)}
        </p>
        <span
          className={cn(
            'inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold',
            status.className,
          )}
        >
          {status.label}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {session.myStudents.map((student) => (
            <span key={student.id} className="inline-flex items-center gap-1.5">
              <span className="text-sm font-semibold text-ink">{student.name}</span>
              {student.attendance ? (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    student.attendance === 'present'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800',
                  )}
                >
                  {student.attendance === 'present' ? 'Present' : 'Absent'}
                </span>
              ) : null}
            </span>
          ))}
          {isGroup ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
              <Users aria-hidden className="size-3" />
              {session.groupName} · group of {session.classSize}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
          {session.program ? <Detail icon={GraduationCap}>{session.program}</Detail> : null}
          {session.tutor ? <Detail icon={UserRound}>{session.tutor}</Detail> : null}
          {session.classroom ? <Detail icon={DoorOpen}>{session.classroom}</Detail> : null}
        </div>
      </div>
    </li>
  )
}

export function ScheduleAgenda({ buckets }: { buckets: ScheduleBucket[] }) {
  return (
    <div className="space-y-4">
      {buckets.map((bucket) => (
        <section key={bucket.key} className="space-y-2">
          {bucket.label ? (
            <h2 className="px-1 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
              {bucket.label}
            </h2>
          ) : null}
          {bucket.days.map((day) => (
            <DashboardPanel key={day.key}>
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-bold text-ink">
                  {day.label}{' '}
                  <span className="font-medium text-slate-500">· {day.dateLabel}</span>
                </h3>
                <span className="text-xs text-slate-400">{plural(day.sessions.length, 'class')}</span>
              </div>
              <ul className="space-y-2">
                {day.sessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </ul>
            </DashboardPanel>
          ))}
        </section>
      ))}
    </div>
  )
}
