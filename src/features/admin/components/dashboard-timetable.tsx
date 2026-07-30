import { format, startOfDay } from 'date-fns'

import { ClassroomTimetable } from '../../../shared/components/timetable'
import { Card } from '../../../shared/components/ui/card'
import type { TimetableColumn, TimetableEvent } from '../../../shared/components/timetable'
import {
  ScheduleFormDialog,
  useScheduleDialogState,
} from '../../schedules/components/schedule-form-dialog'

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

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-3 overflow-hidden">
      <ScheduleFormDialog
        context={scheduleDialog.context}
        onOpenChange={scheduleDialog.setOpen}
      />
      <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            {dateLabel}&apos;s Timetable
          </h3>
          <p className="text-sm text-slate-500">
            Click and drag across empty slots to block multiple hours, or click
            a session card to edit it.
          </p>
        </div>
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
      </div>

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-slate-500">
            Loading schedule…
          </p>
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
            maxHeight="70vh"
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
    </Card>
  )
}
