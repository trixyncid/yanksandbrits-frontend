import { format, startOfDay } from 'date-fns'
import { useEffect, useState } from 'react'

import { ClassroomTimetable } from '../../../shared/components/timetable'
import { Card } from '../../../shared/components/ui/card'
import { Select } from '../../../shared/components/ui/select'
import { AdminShell } from '../../admin/components/admin-shell'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import {
  ScheduleFormDialog,
  useScheduleDialogState,
} from '../../schedules/components/schedule-form-dialog'
import { useDayScheduleQuery } from '../../schedules/hooks/use-day-schedule-query'
import { ScheduleDateNavigator } from '../components/schedule-date-navigator'

export default function FullSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [branchId, setBranchId] = useState('')
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
          <div className="flex flex-col gap-5 border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Full Schedule
                </h2>
                <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                  Classroom timetable for{' '}
                  <span className="font-semibold text-slate-700">
                    {branchLabel}
                  </span>
                  . Click an empty slot range to create a session, or click a
                  card to edit.
                </p>
              </div>

              <label className="flex w-full flex-col gap-1.5 sm:w-56 lg:items-end">
                <span className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase lg:self-end">
                  Branch
                </span>
                <Select
                  value={branchId}
                  aria-label="Select branch"
                  disabled={branchesQuery.isLoading || branches.length === 0}
                  onChange={(event) => setBranchId(event.target.value)}
                  containerClassName="w-full sm:w-full"
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
              </label>
            </div>

            <ScheduleDateNavigator
              value={selectedDate}
              onChange={setSelectedDate}
              sessionCount={
                scheduleQuery.isLoading || scheduleQuery.isFetching
                  ? undefined
                  : events.length
              }
            />
          </div>

          <div className="space-y-3 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-end gap-2 text-[11px] font-semibold">
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
              <span className="self-center text-[10px] font-medium text-slate-400">
                Badge = status · Card = program color
              </span>
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
