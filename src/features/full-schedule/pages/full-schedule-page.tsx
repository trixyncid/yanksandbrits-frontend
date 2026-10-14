import {
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import {
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  Clock3,
  DoorOpen,
  Building2,
  MousePointerClick,
  Timer,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import type {
  TimetableColumn,
  TimetableEvent,
} from '../../../shared/components/timetable'
import {
  EmptyState,
  ListErrorState,
  PageHero,
} from '../../../shared/components/page'
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
import { TutorSwitchRequestsPanel } from '../../schedules/components/tutor-switch-requests-panel'

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
  const tutorDayLoading =
    tutorScheduleQuery.isLoading || tutorScheduleQuery.isFetching
  const staffDayReady =
    Boolean(branchId) &&
    staffScheduleQuery.isSuccess &&
    !staffScheduleQuery.isFetching
  const roomsInUse = new Set(dayEvents.map((event) => event.classroomId)).size
  const hoursBooked =
    Math.round(
      dayEvents.reduce((total, event) => total + event.durationHours, 0) * 10,
    ) / 10
  const monthBooked = monthSessions.filter(
    (session) => session.status !== 'cancelled',
  ).length
  const nextSession = viewingToday ? upcomingSessions[0] : undefined

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
      <AdminShell mainClassName="px-3 pb-6 sm:px-5">
        <ScheduleFormDialog
          context={scheduleDialog.context}
          onOpenChange={scheduleDialog.setOpen}
        />
        <div className="space-y-3">
          <PageHero
            eyebrow="Teaching"
            title="My Schedule"
            description="Pick a day on the calendar to see your classes, then follow the day on the timeline."
            theme="sky"
            pattern="grid"
            actions={
              !viewingToday ? (
                <Button variant="ink" onClick={() => selectDate(new Date())}>
                  <CalendarCheck2 className="size-4" />
                  Jump to today
                </Button>
              ) : null
            }
            stats={[
              {
                id: 'day',
                label: viewingToday ? 'Today' : format(selectedDate, 'EEE d MMM'),
                value: tutorDayLoading ? '–' : tutorSessions.length,
                icon: CalendarDays,
                caption: `Session${tutorSessions.length === 1 ? '' : 's'} on this day`,
                hint: 'Jump to the day timeline',
                onSelect: scrollToTimeline,
              },
              {
                id: 'month',
                label: format(visibleMonth, 'MMMM'),
                value: monthRangeQuery.isLoading ? '–' : monthBooked,
                icon: CalendarRange,
                caption: 'Sessions this month',
              },
              {
                id: 'next',
                label: 'Next class',
                value: nextSession ? nextSession.startTimeLabel : '–',
                icon: Clock3,
                caption: nextSession
                  ? nextSession.title
                  : viewingToday
                    ? 'Nothing else today'
                    : 'Shown when viewing today',
              },
            ]}
          />

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
                    <p className="text-base font-bold text-ink">
                      Day timeline
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">
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

                {tutorDayLoading ? (
                  <div className="space-y-2 py-4" aria-busy="true">
                    <div className="h-10 animate-pulse rounded-full bg-canvas" />
                    <div className="h-24 animate-pulse rounded-3xl bg-canvas/70" />
                  </div>
                ) : tutorScheduleQuery.isError ? (
                  <ListErrorState
                    title="Unable to load your schedule"
                    description="Something went wrong while fetching this day. Try again or pick another day."
                    onRetry={() => void tutorScheduleQuery.refetch()}
                  />
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
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <ScheduleFormDialog
        context={scheduleDialog.context}
        onOpenChange={scheduleDialog.setOpen}
      />
      <div className="space-y-3">
        <PageHero
          eyebrow="Academics"
          title="Full Schedule"
          description={`See which classrooms at ${branchLabel} are free, hour by hour.`}
          theme="sky"
          pattern="grid"
          actions={
            <Select
              value={branchId}
              aria-label="Select branch"
              disabled={branchesQuery.isLoading || branches.length === 0}
              onChange={(event) => setBranchId(event.target.value)}
              containerClassName="w-full sm:min-w-56 sm:w-auto"
              className="h-11 min-w-0 rounded-full border-transparent bg-white py-1.5 font-semibold text-ink shadow-sm"
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
          }
          stats={[
            {
              id: 'sessions',
              label: viewingToday ? 'Sessions today' : 'Sessions',
              value: staffDayReady ? dayEvents.length : '–',
              icon: CalendarDays,
              caption: format(selectedDate, 'EEEE, d MMM'),
            },
            {
              id: 'rooms',
              label: 'Rooms in use',
              value: staffDayReady
                ? `${roomsInUse}/${classrooms.length}`
                : '–',
              icon: DoorOpen,
              caption: staffDayReady
                ? `${Math.max(classrooms.length - roomsInUse, 0)} free all day`
                : undefined,
            },
            {
              id: 'hours',
              label: 'Hours booked',
              value: staffDayReady ? hoursBooked : '–',
              icon: Timer,
              caption: 'Across every room',
            },
          ]}
        />

        <TutorSwitchRequestsPanel />

        <section className="animate-in fade-in slide-in-from-bottom-2 space-y-4 rounded-[1.75rem] bg-white p-3 sm:p-5">
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
            <EmptyState
              icon={Building2}
              title="Choose a branch"
              description="Pick a branch at the top to see its classrooms and sessions."
              className="bg-canvas"
            />
          ) : staffScheduleQuery.isLoading || staffScheduleQuery.isFetching ? (
            <div
              className="grid grid-cols-[4.5rem_repeat(3,minmax(0,1fr))] gap-2"
              aria-busy="true"
              aria-label="Loading schedule"
            >
              {Array.from({ length: 24 }).map((_, index) => (
                <div
                  key={index}
                  className={
                    index % 4 === 0
                      ? 'h-14 animate-pulse rounded-2xl bg-canvas/60'
                      : 'h-14 animate-pulse rounded-2xl bg-canvas'
                  }
                  style={{ animationDelay: `${index * 25}ms` }}
                />
              ))}
            </div>
          ) : staffScheduleQuery.isError ? (
            <ListErrorState
              title="Unable to load the schedule"
              description="Something went wrong while fetching this day. Try again, or pick another branch or day."
              onRetry={() => void staffScheduleQuery.refetch()}
            />
          ) : classrooms.length === 0 ? (
            <EmptyState
              icon={DoorOpen}
              title="No classrooms at this branch yet"
              description="Add classrooms for this branch to start booking sessions."
              className="bg-canvas"
            />
          ) : (
            <>
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
              {schedulePerms.canAdd || schedulePerms.canChange ? (
                <p className="flex items-center gap-1.5 px-1 text-xs text-slate-500">
                  <MousePointerClick className="size-3.5 shrink-0" />
                  {schedulePerms.canAdd && schedulePerms.canChange
                    ? 'Drag down an empty column to book a room, or click a session to change it.'
                    : schedulePerms.canAdd
                      ? 'Drag down an empty column to book a room.'
                      : 'Click a session to change it.'}
                </p>
              ) : null}
            </>
          )}
        </section>
      </div>
    </AdminShell>
  )
}
