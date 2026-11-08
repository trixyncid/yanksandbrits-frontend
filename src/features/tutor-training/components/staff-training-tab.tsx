import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import {
  CalendarClock,
  CalendarPlus,
  Check,
  ChevronDown,
  DoorOpen,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { useAuthUser } from '../../auth/hooks/use-permissions'
import { hasAuthRole } from '../../auth/types/auth'
import type { UserDetail } from '../../users/api/users-api'
import {
  deleteTrainingSession,
  fetchTrainingOptions,
  fetchTrainingTimeline,
  fetchTutorTrainings,
  removeTraining,
  setTrainingSessionStatus,
  tutorTrainingQueryKeys,
  type TrainingSessionStatus,
  type TrainingTimelineSession,
  type TutorTraining,
} from '../api/tutor-training-api'
import { AssignTrainingDialog, EditTrainingDialog, ScheduleSessionsDialog } from './training-dialogs'

const STATUS_STYLE: Record<TrainingSessionStatus, { label: string; className: string }> = {
  booked: { label: 'Booked', className: 'bg-brand-50 text-brand-700' },
  done: { label: 'Done', className: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-50 text-rose-700' },
}

function timeRange(session: TrainingTimelineSession) {
  return `${format(parseISO(session.start), 'HH:mm')}–${format(parseISO(session.end), 'HH:mm')}`
}

function dayLabel(value: string) {
  const date = parseISO(value)
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'EEEE')
}

function StatusChip({ status }: { status: TrainingSessionStatus }) {
  const style = STATUS_STYLE[status]
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold', style.className)}>
      {style.label}
    </span>
  )
}

/** A tutor's training programs (run by their academic leader) and their full schedule. */
export function StaffTrainingTab({ user }: { user: UserDetail }) {
  const queryClient = useQueryClient()
  const me = useAuthUser()
  const [range, setRange] = useState<'upcoming' | 'past'>('upcoming')
  const [assignOpen, setAssignOpen] = useState(false)
  const [scheduling, setScheduling] = useState<TutorTraining | null>(null)
  const [editing, setEditing] = useState<TutorTraining | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const trainingsQuery = useQuery({
    queryKey: tutorTrainingQueryKeys.forTutor(user.id),
    queryFn: () => fetchTutorTrainings(user.id),
  })
  const timelineQuery = useQuery({
    queryKey: tutorTrainingQueryKeys.timeline(user.id, range),
    queryFn: () => fetchTrainingTimeline(user.id, range),
  })
  const optionsQuery = useQuery({
    queryKey: tutorTrainingQueryKeys.options(user.id),
    queryFn: () => fetchTrainingOptions(user.id),
  })

  const canManageAll = Boolean(optionsQuery.data?.canManageAll)
  const isLeader = hasAuthRole(me, 'academic-leader')
  const canAssign = canManageAll || isLeader
  const canManage = (training: TutorTraining) =>
    canManageAll || (isLeader && String(me?.id) === training.leaderId)

  const trainings = trainingsQuery.data ?? []
  const days = useMemo(() => {
    const groups: { key: string; label: string; date: string; sessions: TrainingTimelineSession[] }[] = []
    for (const session of timelineQuery.data ?? []) {
      const key = session.start.slice(0, 10)
      let group = groups.find((item) => item.key === key)
      if (!group) {
        group = { key, label: dayLabel(session.start), date: format(parseISO(session.start), 'd MMM yyyy'), sessions: [] }
        groups.push(group)
      }
      group.sessions.push(session)
    }
    return groups
  }, [timelineQuery.data])

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: tutorTrainingQueryKeys.all })
  }

  async function changeStatus(session: TrainingTimelineSession, status: TrainingSessionStatus) {
    try {
      await setTrainingSessionStatus(session.id, status)
      await refresh()
    } catch (error) {
      notify('error', { title: 'Unable to update session', description: getApiErrorMessage(error) })
    }
  }

  function confirmDeleteSession(session: TrainingTimelineSession) {
    requestDeleteConfirm({
      title: 'Delete this session?',
      description: `${format(parseISO(session.start), 'EEE d MMM, HH:mm')} will be removed and its place freed.`,
      onConfirm: () => {
        void deleteTrainingSession(session.id)
          .then(refresh)
          .catch((error) =>
            notify('error', { title: 'Unable to delete session', description: getApiErrorMessage(error) }),
          )
      },
    })
  }

  function confirmRemoveTraining(training: TutorTraining) {
    requestDeleteConfirm({
      title: `Remove ${training.programTitle}?`,
      description: 'The training and its booked sessions are removed. Trainings with finished sessions can’t be removed.',
      onConfirm: () => {
        void removeTraining(training.id)
          .then(refresh)
          .catch((error) =>
            notify('error', { title: 'Unable to remove training', description: getApiErrorMessage(error) }),
          )
      },
    })
  }

  return (
    <div className="space-y-6 p-5 sm:p-6">
      {/* ------------------------------------------------ training programs */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-bold tracking-tight text-ink">Training programs</h4>
            <p className="mt-0.5 text-sm text-slate-500">
              Run by {user.fullName}&apos;s academic leader, who teaches each session.
            </p>
          </div>
          {canAssign ? (
            <Button type="button" variant="soft" size="sm" onClick={() => setAssignOpen(true)}>
              <Plus className="size-3.5" />
              Assign training
            </Button>
          ) : null}
        </div>

        {trainingsQuery.isLoading ? (
          <div className="h-28 animate-pulse rounded-3xl bg-canvas" />
        ) : trainings.length === 0 ? (
          <div className="rounded-3xl bg-canvas px-5 py-8 text-center">
            <GraduationCap className="mx-auto size-6 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-ink">No training yet</p>
            <p className="mt-1 text-xs text-slate-500">
              {canAssign
                ? 'Assign a training program, then book its sessions.'
                : 'Training programs assigned by the academic leader appear here.'}
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {trainings.map((training) => {
              const manage = canManage(training)
              const pct = Math.min(100, Math.round((training.doneSessions / training.plannedSessions) * 100))
              const left = training.plannedSessions - training.bookedSessions
              const isOpen = expanded === training.id
              return (
                <li key={training.id} className="rounded-3xl bg-canvas/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{training.programTitle}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                        <UserRound className="size-3.5" />
                        Taught by {training.leaderName}
                      </p>
                    </div>
                    {manage ? (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          aria-label="Edit training"
                          onClick={() => setEditing(training)}
                          className="inline-flex size-8 items-center justify-center rounded-full bg-white text-slate-600 hover:text-ink"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Remove training"
                          onClick={() => confirmRemoveTraining(training)}
                          className="inline-flex size-8 items-center justify-center rounded-full bg-white text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink tabular-nums">
                        {training.doneSessions} of {training.plannedSessions} sessions done
                      </span>
                      <span className="text-slate-500">{left > 0 ? `${left} to book` : 'All booked'}</span>
                    </div>
                    <div
                      className="mt-1.5 h-2 overflow-hidden rounded-full bg-violet-100"
                      role="meter"
                      aria-label="Training progress"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                    <CalendarClock className="size-3.5 text-violet-500" />
                    {training.nextSession
                      ? `Next: ${format(parseISO(training.nextSession.start), 'EEE d MMM, HH:mm')}${training.nextSession.classroom ? ` · ${training.nextSession.classroom}` : ''}`
                      : 'No session booked'}
                  </p>
                  {training.note ? <p className="mt-2 text-xs text-slate-500">{training.note}</p> : null}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {manage && left > 0 ? (
                      <Button type="button" size="sm" onClick={() => setScheduling(training)}>
                        <CalendarPlus className="size-3.5" />
                        Book sessions
                      </Button>
                    ) : null}
                    {training.sessions.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : training.id)}
                        aria-expanded={isOpen}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-ink"
                      >
                        {training.sessions.length} session{training.sessions.length === 1 ? '' : 's'}
                        <ChevronDown className={cn('size-3.5 transition', isOpen && 'rotate-180')} />
                      </button>
                    ) : null}
                  </div>

                  {isOpen ? (
                    <ul className="mt-3 space-y-1.5">
                      {training.sessions.map((session) => (
                        <li
                          key={session.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-3 py-2"
                        >
                          <div className="min-w-0 text-xs">
                            <p className="font-semibold text-ink tabular-nums">
                              {format(parseISO(session.start), 'EEE d MMM')} · {timeRange(session)}
                            </p>
                            <p className="text-slate-500">{session.classroom || 'No room'}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <StatusChip status={session.status} />
                            {manage && session.status === 'booked' ? (
                              <>
                                <button
                                  type="button"
                                  aria-label="Mark done"
                                  title="Mark done"
                                  onClick={() => void changeStatus(session, 'done')}
                                  className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                >
                                  <Check className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Cancel session"
                                  title="Cancel"
                                  onClick={() => void changeStatus(session, 'cancelled')}
                                  className="inline-flex size-7 items-center justify-center rounded-full bg-canvas text-slate-600 hover:text-ink"
                                >
                                  <X className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Delete session"
                                  title="Delete"
                                  onClick={() => confirmDeleteSession(session)}
                                  className="inline-flex size-7 items-center justify-center rounded-full bg-canvas text-rose-500 hover:bg-rose-50"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* ----------------------------------------------------------- schedule */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold tracking-tight text-ink">Schedule</h4>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span aria-hidden className="size-2 rounded-full bg-violet-500" /> Training
              </span>
              <span className="inline-flex items-center gap-1">
                <span aria-hidden className="size-2 rounded-full bg-brand-500" /> Teaching
              </span>
            </p>
          </div>
          <div className="inline-flex rounded-full bg-canvas p-1" role="tablist" aria-label="Range">
            {(['upcoming', 'past'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={range === value}
                onClick={() => setRange(value)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                  range === value ? 'bg-ink text-white' : 'text-slate-600 hover:text-ink',
                )}
              >
                {value === 'upcoming' ? 'Upcoming' : 'Past 30 days'}
              </button>
            ))}
          </div>
        </div>

        {timelineQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-canvas/70" />
            ))}
          </div>
        ) : days.length === 0 ? (
          <p className="rounded-3xl bg-canvas px-4 py-6 text-center text-sm text-slate-500">
            {range === 'upcoming'
              ? 'Nothing booked. Training sessions and classes show up here.'
              : 'No training or classes in the last 30 days.'}
          </p>
        ) : (
          <div className="space-y-3">
            {days.map((day) => (
              <div key={day.key}>
                <p className="mb-1.5 px-1 text-xs font-bold text-ink">
                  {day.label} <span className="font-medium text-slate-500">· {day.date}</span>
                </p>
                <ul className="space-y-1.5">
                  {day.sessions.map((session) => {
                    const isTraining = session.kind === 'training'
                    return (
                      <li
                        key={session.id}
                        className={cn(
                          'flex flex-wrap items-center gap-3 rounded-2xl border-l-4 bg-canvas/70 px-4 py-2.5',
                          isTraining ? 'border-violet-500' : 'border-brand-500',
                          session.status === 'cancelled' && 'opacity-60',
                        )}
                      >
                        <p className="w-24 shrink-0 text-sm font-bold text-ink tabular-nums">{timeRange(session)}</p>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">
                            <span className={cn('mr-1.5 text-[11px] font-bold uppercase', isTraining ? 'text-violet-600' : 'text-brand-600')}>
                              {isTraining ? 'Training' : 'Teaching'}
                            </span>
                            {session.program || 'Class'}
                          </p>
                          <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
                            {session.withName ? (
                              <span className="inline-flex items-center gap-1">
                                <UserRound className="size-3" />
                                {isTraining ? `with ${session.withName}` : session.withName}
                              </span>
                            ) : null}
                            {session.classroom ? (
                              <span className="inline-flex items-center gap-1">
                                <DoorOpen className="size-3" />
                                {session.classroom}
                              </span>
                            ) : null}
                          </p>
                        </div>
                        <StatusChip status={session.status} />
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <AssignTrainingDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        tutorId={user.id}
        tutorName={user.fullName}
        options={optionsQuery.data}
      />
      <ScheduleSessionsDialog
        open={scheduling !== null}
        onOpenChange={(open) => !open && setScheduling(null)}
        training={scheduling}
        branchId={user.branchId}
      />
      <EditTrainingDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        training={editing}
      />
    </div>
  )
}
