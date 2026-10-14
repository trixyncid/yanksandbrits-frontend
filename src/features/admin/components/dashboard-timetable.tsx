import { format, startOfDay } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays } from 'lucide-react'

import { ClassroomTimetable } from '../../../shared/components/timetable'
import { buttonVariants } from '../../../shared/components/ui/button'
import type { TimetableColumn, TimetableEvent } from '../../../shared/components/timetable'
import {
  ScheduleFormDialog,
  useScheduleDialogState,
} from '../../schedules/components/schedule-form-dialog'
import { DashboardPanel } from './dashboard-section'

export type DashboardTimetableProps = {
  columns: TimetableColumn[]
  events: TimetableEvent[]
  branchId?: string
  isLoading?: boolean
  dateLabel?: string
}

export function DashboardTimetable({
  columns,
  events,
  branchId = '',
  isLoading = false,
  dateLabel = 'Today',
}: DashboardTimetableProps) {
  const scheduleDialog = useScheduleDialogState()
  const todayKey = format(startOfDay(new Date()), 'yyyy-MM-dd')
  const todayLabel = format(startOfDay(new Date()), 'EEEE, MMM d')

  return (
    <DashboardPanel className="overflow-hidden p-0 sm:p-0">
      <ScheduleFormDialog
        context={scheduleDialog.context}
        onOpenChange={scheduleDialog.setOpen}
      />

      <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:pt-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <CalendarDays className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-ink sm:text-lg">
                {dateLabel}&apos;s timetable
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
                Live
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {todayLabel} · {events.length} session
              {events.length === 1 ? '' : 's'} scheduled · pick an empty slot to
              book a class
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">
              <span className="size-2 rounded-full bg-brand-500" />
              Ongoing
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
              <span className="size-2 rounded-full bg-emerald-500" />
              Finished
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">
              <span className="size-2 rounded-full bg-rose-500" />
              Cancelled
            </span>
          </div>
          <Link
            to="/full-schedule"
            className={buttonVariants({ variant: 'ink', size: 'sm' })}
          >
            Open full schedule
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        {isLoading ? (
          <div className="space-y-2 py-6" aria-busy="true">
            <div className="mx-auto h-4 w-40 animate-pulse rounded-full bg-canvas" />
            <div className="h-48 animate-pulse rounded-3xl bg-canvas" />
          </div>
        ) : columns.length === 0 ? (
          <p className="rounded-3xl bg-canvas px-4 py-14 text-center text-sm text-slate-500">
            This branch has no classrooms yet. Add a classroom to start
            booking sessions.
          </p>
        ) : (
          <ClassroomTimetable
            columns={columns}
            events={events}
            startHour={8}
            endHour={21}
            maxHeight="58vh"
            onEventClick={(event) => {
              if (!branchId) return
              scheduleDialog.openEdit({
                scheduleId: event.id,
                branchId,
                event,
              })
            }}
            onSlotRangeSelect={(column, range) => {
              if (!branchId) return
              scheduleDialog.openCreate({
                date: todayKey,
                branchId,
                column,
                startHour: range.startHour,
                endHour: range.endHour,
              })
            }}
          />
        )}
      </div>
    </DashboardPanel>
  )
}
