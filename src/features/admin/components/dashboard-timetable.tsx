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
    <DashboardPanel className="overflow-hidden p-0">
      <ScheduleFormDialog
        context={scheduleDialog.context}
        onOpenChange={scheduleDialog.setOpen}
      />

      <div className="flex flex-col gap-4 border-b border-slate-200 bg-[#F8FBFF] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#2F5A94] uppercase ring-1 ring-[#D8E6FA]">
              <CalendarDays className="size-3.5" />
              Live today
            </span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            {dateLabel}&apos;s timetable
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {todayLabel} · {events.length} session
            {events.length === 1 ? '' : 's'} scheduled
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF4FF] px-2.5 py-1 text-[#2F5A94]">
              <span className="size-2 rounded-full bg-[#4274B9]" />
              Ongoing
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F7EF] px-2.5 py-1 text-[#1F5A3D]">
              <span className="size-2 rounded-full bg-[#3D9B6E]" />
              Finished
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCEEF1] px-2.5 py-1 text-[#6E2433]">
              <span className="size-2 rounded-full bg-[#C45B6E]" />
              Cancelled
            </span>
          </div>
          <Link
            to="/full-schedule"
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            Open full schedule
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-3 py-10">
            <div className="mx-auto h-4 w-40 animate-pulse rounded bg-slate-100" />
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : columns.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">
            No classrooms found for this branch. Add classrooms to start
            scheduling sessions.
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
