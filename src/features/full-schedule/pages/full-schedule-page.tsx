import { addDays, format, isSameDay, startOfDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ClassroomTimetable } from '../../../shared/components/timetable'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Select } from '../../../shared/components/ui/select'
import { AdminShell } from '../../admin/components/admin-shell'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import {
  ScheduleFormDialog,
  useScheduleDialogState,
} from '../../schedules/components/schedule-form-dialog'
import { useDayScheduleQuery } from '../../schedules/hooks/use-day-schedule-query'

export default function FullSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [branchId, setBranchId] = useState('')
  const today = startOfDay(new Date())
  const isToday = isSameDay(selectedDate, today)
  const scheduleDialog = useScheduleDialogState()

  const branchesQuery = useBranchesQuery()
  const branches = branchesQuery.data?.data ?? []

  useEffect(() => {
    if (!branchId && branches.length > 0) {
      setBranchId(branches[0]!.id)
    }
  }, [branchId, branches])

  const dateKey = format(selectedDate, 'yyyy-MM-dd')
  const branchLabel =
    branches.find((branch) => branch.id === branchId)?.name ?? 'Select branch'

  const scheduleQuery = useDayScheduleQuery(
    branchId
      ? {
          date: dateKey,
          branchId,
        }
      : null,
  )

  const columns = scheduleQuery.data?.columns ?? []
  const events = scheduleQuery.data?.events ?? []

  return (
    <AdminShell>
      <ScheduleFormDialog
        context={scheduleDialog.context}
        onOpenChange={scheduleDialog.setOpen}
      />
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-5 border-b border-slate-200 p-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Full Schedule | Branch: {branchLabel}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Overview schedule for{' '}
                <span className="font-semibold text-slate-700">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </span>
                . Click and drag across slots to block multiple hours, or click
                a session card to edit it.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
              <Select
                value={branchId}
                aria-label="Select branch"
                disabled={branchesQuery.isLoading || branches.length === 0}
                onChange={(event) => setBranchId(event.target.value)}
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

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Previous day"
                  onClick={() =>
                    setSelectedDate((current) => addDays(current, -1))
                  }
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <DatePicker
                  value={selectedDate}
                  onChange={(date) => {
                    if (date) {
                      setSelectedDate(startOfDay(date))
                    }
                  }}
                  title="Schedule date"
                />

                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Next day"
                  onClick={() =>
                    setSelectedDate((current) => addDays(current, 1))
                  }
                >
                  <ChevronRight className="size-4" />
                </Button>

                <Button
                  variant={isToday ? 'primary' : 'secondary'}
                  size="sm"
                  disabled={isToday}
                  onClick={() => setSelectedDate(today)}
                >
                  Today
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Now showing: {format(selectedDate, 'MMM d, yyyy')} ·{' '}
                {events.length} sessions
              </p>
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

            {scheduleQuery.isLoading || scheduleQuery.isFetching ? (
              <p className="py-16 text-center text-sm text-slate-500">
                Loading schedule…
              </p>
            ) : scheduleQuery.isError ? (
              <p className="py-16 text-center text-sm text-rose-600">
                Unable to load schedule. Please try another branch or date.
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
                maxHeight="72vh"
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
                    date: dateKey,
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
      </div>
    </AdminShell>
  )
}
