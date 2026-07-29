import { addDays, format, isSameDay, startOfDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import {
  ClassroomTimetable,
  formatHourLabel,
  type TimetableColumn,
  type TimetableEvent,
} from '../../../shared/components/timetable'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Select } from '../../../shared/components/ui/select'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  fullScheduleColumns,
  getFullScheduleEventsForDate,
} from '../data/full-schedule-placeholder'

const branchOptions = [
  { value: 'main', label: 'Main Branch' },
  { value: 'west', label: 'West Branch' },
  { value: 'south', label: 'South Branch' },
]

function handleEventClick(event: TimetableEvent) {
  notify('info', {
    title: event.title,
    description: `${event.subtitle} • ${formatHourLabel(event.startHour)}`,
  })
}

function handleSlotClick(column: TimetableColumn, hour: number) {
  notify('info', {
    title: `Create class in ${column.label}`,
    description: `Selected slot: ${formatHourLabel(hour)}. This will open a schedule form later.`,
  })
}

export default function FullSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const [branchId, setBranchId] = useState('main')
  const today = startOfDay(new Date())
  const isToday = isSameDay(selectedDate, today)
  const branchLabel =
    branchOptions.find((option) => option.value === branchId)?.label ??
    'Main Branch'
  const events = getFullScheduleEventsForDate(selectedDate)

  return (
    <AdminShell>
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
                . Choose any date to review classroom sessions.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
              <Select
                value={branchId}
                aria-label="Select branch"
                onChange={(event) => setBranchId(event.target.value)}
              >
                {branchOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Now showing: {format(selectedDate, 'MMM d, yyyy')} ·{' '}
              {events.length} sessions
            </p>

            <ClassroomTimetable
              columns={fullScheduleColumns}
              events={events}
              startHour={8}
              endHour={21}
              maxHeight="72vh"
              onEventClick={handleEventClick}
              onSlotClick={handleSlotClick}
            />
          </div>
        </Card>
      </div>
    </AdminShell>
  )
}
