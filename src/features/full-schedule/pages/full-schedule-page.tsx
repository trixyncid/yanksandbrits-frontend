import {
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'

import type {
  TimetableColumn,
  TimetableEvent,
} from '../../../shared/components/timetable'
import { Button } from '../../../shared/components/ui/button'
import { Select } from '../../../shared/components/ui/select'
import { AdminShell } from '../../admin/components/admin-shell'
import { DashboardPanel } from '../../admin/components/dashboard-section'
import {
  useIsTutor,
  useModulePermissions,
} from '../../auth/hooks/use-permissions'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import {
  ScheduleFormDialog,
  useScheduleDialogState,
} from '../../schedules/components/schedule-form-dialog'
import { useDayScheduleQuery } from '../../schedules/hooks/use-day-schedule-query'
import {
  mapDayRowsToWeekEvents,
  weekEventToTimetableEvent,
} from '../../schedules/lib/map-week-schedule-events'
import { AdminWeekCalendar } from '../components/admin-week-calendar'
import { AdminWeekToolbar } from '../components/admin-week-toolbar'
import {
  buildTutorMonthMarkers,
  TutorMonthCalendar,
} from '../components/tutor-month-calendar'
import { TutorDayTimeline } from '../components/tutor-day-timeline'
import {
  sessionsForUpcomingPanel,
  TutorUpcomingClasses,
} from '../components/tutor-upcoming-classes'
import { useTutorDayScheduleQuery } from '../hooks/use-tutor-day-schedule-query'
import { useTutorScheduleRangeQuery } from '../hooks/use-tutor-schedule-range-query'
import type { TutorDaySession } from '../lib/map-tutor-day-sessions'

function tutorSessionToTimetableEvent(
  session: TutorDaySession,
): TimetableEvent {
  return {
    id: session.id,
    columnId: 'tutor',
    title: session.subtitle,
    subtitle: session.title,
    startHour: session.startHour,
    durationHours: Math.max(session.endHour - session.startHour, 0.5),
    tone:
      session.status === 'finished'
        ? 'green'
        : session.status === 'cancelled'
          ? 'rose'
          : 'blue',
    backgroundColor: session.backgroundColor,
    textColor: session.textColor,
    status: session.status.toUpperCase(),
    meta: session.classroom,
  }
}

export default function FullSchedulePage() {
  const isTutor = useIsTutor()
  const schedulePerms = useModulePermissions('schedules')
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date()),
  )
  const [branchId, setBranchId] = useState('')
  const scheduleDialog = useScheduleDialogState()
  const timelineRef = useRef<HTMLDivElement>(null)

  const branchesQuery = useBranchesQuery()
  const branches = branchesQuery.data?.data ?? []

  useEffect(() => {
    if (isTutor) return
    if (!branchId && branches.length > 0) {
      const main = branches.find((branch) => branch.isMain)
      setBranchId(main?.id ?? branches[0]!.id)
    }
  }, [branchId, branches, isTutor])

  const dateKey = format(selectedDate, 'yyyy-MM-dd')
  const monthStartKey = format(startOfMonth(visibleMonth), 'yyyy-MM-dd')
  const monthEndKey = format(endOfMonth(visibleMonth), 'yyyy-MM-dd')
  const branchLabel =
    branches.find((branch) => branch.id === branchId)?.name ?? 'Select branch'

  const staffScheduleQuery = useDayScheduleQuery(
    !isTutor && branchId
      ? {
          date: dateKey,
          branchId,
        }
      : null,
  )

  const tutorScheduleQuery = useTutorDayScheduleQuery(isTutor ? dateKey : null)
  const monthRangeQuery = useTutorScheduleRangeQuery(
    isTutor ? monthStartKey : null,
    isTutor ? monthEndKey : null,
  )

  const classrooms = staffScheduleQuery.data?.columns ?? []
  const dayEvents = useMemo(
    () =>
      mapDayRowsToWeekEvents(staffScheduleQuery.data?.rows ?? [], dateKey),
    [staffScheduleQuery.data?.rows, dateKey],
  )

  const tutorSessions = tutorScheduleQuery.data ?? []
  const monthSessions = monthRangeQuery.data ?? []
  const monthMarkers = useMemo(
    () => buildTutorMonthMarkers(monthSessions),
    [monthSessions],
  )
  const upcomingSessions = useMemo(
    () =>
      sessionsForUpcomingPanel(tutorSessions, selectedDate, monthSessions),
    [tutorSessions, selectedDate, monthSessions],
  )
  const viewingToday = isSameDay(selectedDate, startOfDay(new Date()))

  function openTutorSession(session: TutorDaySession) {
    if (session.dateKey && session.dateKey !== dateKey) {
      selectDate(startOfDay(parseISO(session.dateKey)))
    }
    if (!schedulePerms.canChange) {
      scrollToTimeline()
      return
    }
    const editBranchId = branchId || (branches[0]?.id ?? '')
    if (!editBranchId) {
      scrollToTimeline()
      return
    }
    scheduleDialog.openEdit({
      scheduleId: session.id,
      branchId: editBranchId,
      event: tutorSessionToTimetableEvent(session),
    })
  }

  function scrollToTimeline() {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function selectDate(date: Date) {
    const next = startOfDay(date)
    setSelectedDate(next)
    setVisibleMonth(startOfMonth(next))
  }

  function openStaffCreate(
    column: TimetableColumn,
    startHour: number,
    endHour: number,
  ) {
    if (!branchId || !schedulePerms.canAdd) return
    scheduleDialog.openCreate({
      date: dateKey,
      branchId,
      column,
      startHour,
      endHour,
    })
  }

  if (isTutor) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <ScheduleFormDialog
          context={scheduleDialog.context}
          onOpenChange={scheduleDialog.setOpen}
        />
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
                My Schedule
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-500">
                Pick a day, scan upcoming classes, and read the day as a
                timeline.
              </p>
              <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                Showing{' '}
                <span className="font-semibold text-slate-600">
                  {format(selectedDate, 'EEEE, d MMM yyyy')}
                </span>
                {!tutorScheduleQuery.isLoading &&
                !tutorScheduleQuery.isFetching ? (
                  <>
                    {' '}
                    ·{' '}
                    <span className="font-semibold tabular-nums text-slate-600">
                      {tutorSessions.length} session
                      {tutorSessions.length === 1 ? '' : 's'}
                    </span>
                  </>
                ) : null}
              </p>
            </div>
            {!viewingToday ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => selectDate(new Date())}
                className="shadow-sm"
              >
                Jump to today
              </Button>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-12 lg:items-start lg:gap-4">
              <div className="lg:col-span-5">
                <TutorMonthCalendar
                  selected={selectedDate}
                  month={visibleMonth}
                  onSelect={selectDate}
                  onMonthChange={setVisibleMonth}
                  markers={monthMarkers}
                />
              </div>
              <div className="lg:col-span-7">
                <TutorUpcomingClasses
                  sessions={upcomingSessions}
                  selectedDate={selectedDate}
                  isLoading={
                    tutorScheduleQuery.isLoading ||
                    tutorScheduleQuery.isFetching
                  }
                  isError={tutorScheduleQuery.isError}
                  onSessionClick={openTutorSession}
                  onViewAll={scrollToTimeline}
                />
              </div>
            </div>

            <div ref={timelineRef} className="scroll-mt-4">
              <DashboardPanel
                variant="plump"
                className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:160ms]"
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-slate-900">
                      Day timeline
                    </p>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {format(selectedDate, 'EEEE, d MMM')}
                      {!tutorScheduleQuery.isLoading &&
                      !tutorScheduleQuery.isFetching ? (
                        <>
                          <span className="mx-1.5 text-slate-300">·</span>
                          <span className="font-medium tabular-nums text-slate-600">
                            {tutorSessions.length} session
                            {tutorSessions.length === 1 ? '' : 's'}
                          </span>
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>

                {tutorScheduleQuery.isLoading ||
                tutorScheduleQuery.isFetching ? (
                  <p className="py-14 text-center text-sm text-slate-500">
                    Loading your schedule…
                  </p>
                ) : tutorScheduleQuery.isError ? (
                  <p className="py-14 text-center text-sm text-rose-600">
                    Unable to load your schedule. Please try another day.
                  </p>
                ) : (
                  <TutorDayTimeline
                    sessions={tutorSessions}
                    selectedDate={selectedDate}
                    hideMobileList
                    hideHeader
                    onSessionClick={
                      schedulePerms.canChange ? openTutorSession : undefined
                    }
                  />
                )}
              </DashboardPanel>
            </div>
          </div>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <ScheduleFormDialog
        context={scheduleDialog.context}
        onOpenChange={scheduleDialog.setOpen}
      />
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
              Full Schedule
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              See which classrooms are free by time for{' '}
              <span className="font-semibold text-slate-700">{branchLabel}</span>.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Select
              value={branchId}
              aria-label="Select branch"
              disabled={branchesQuery.isLoading || branches.length === 0}
              onChange={(event) => setBranchId(event.target.value)}
              containerClassName="w-full sm:min-w-56 sm:w-auto"
              className="h-10 min-w-0 rounded-full border-slate-200 bg-white py-1.5"
            >
              {branches.length === 0 ? (
                <option value="">Loading branches…</option>
              ) : (
                branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))
              )}
            </Select>
          </div>
        </div>

        <AdminWeekToolbar
          selectedDate={selectedDate}
          onDateChange={selectDate}
          canAdd={schedulePerms.canAdd && Boolean(branchId)}
          onAdd={() =>
            openStaffCreate(
              classrooms[0] ?? { id: '', label: 'classroom' },
              9,
              10,
            )
          }
        />

        {!branchId ? (
          <p className="rounded-2xl border border-slate-200 bg-white py-14 text-center text-sm text-slate-500">
            Select a branch to view the schedule.
          </p>
        ) : staffScheduleQuery.isLoading || staffScheduleQuery.isFetching ? (
          <p className="rounded-2xl border border-slate-200 bg-white py-14 text-center text-sm text-slate-500">
            Loading schedule…
          </p>
        ) : staffScheduleQuery.isError ? (
          <p className="rounded-2xl border border-slate-200 bg-white py-14 text-center text-sm text-rose-600">
            Unable to load schedule. Please try another branch or day.
          </p>
        ) : classrooms.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white py-14 text-center text-sm text-slate-500">
            No classrooms found for this branch. Add classrooms to start
            scheduling sessions.
          </p>
        ) : (
          <AdminWeekCalendar
            dateKey={dateKey}
            classrooms={classrooms}
            events={dayEvents}
            onEventClick={
              schedulePerms.canChange
                ? (event) => {
                    if (!branchId) return
                    scheduleDialog.openEdit({
                      scheduleId: event.id,
                      branchId,
                      event: weekEventToTimetableEvent(event),
                    })
                  }
                : undefined
            }
            onSlotSelect={
              schedulePerms.canAdd
                ? (classroom, startHour, endHour) =>
                    openStaffCreate(classroom, startHour, endHour)
                : undefined
            }
          />
        )}
      </div>
    </AdminShell>
  )
}
