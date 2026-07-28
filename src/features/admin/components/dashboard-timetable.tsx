import { ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'

import {
  ClassroomTimetable,
  formatHourLabel,
  type TimetableColumn,
  type TimetableEvent,
} from '../../../shared/components/timetable'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { notify } from '../../../shared/lib/notify'
import {
  dashboardTimetableColumns,
  dashboardTimetableEvents,
} from '../data/dashboard-timetable-placeholder'

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

export function DashboardTimetable() {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-3 overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Today&apos;s Timetable</h3>
          <p className="text-sm text-slate-500">
            8:00 AM – 8:00 PM schedule with sticky time and header while scrolling.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              notify('info', {
                title: 'Previous day placeholder',
                description: 'Date navigation will be connected later.',
              })
            }
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              notify('info', {
                title: 'Date picker placeholder',
                description: 'Interactive calendar controls will be added later.',
              })
            }
          >
            <Clock3 className="size-4" />
            Today
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              notify('info', {
                title: 'Next day placeholder',
                description: 'Date navigation will be connected later.',
              })
            }
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <ClassroomTimetable
          columns={dashboardTimetableColumns}
          events={dashboardTimetableEvents}
          startHour={8}
          endHour={21}
          maxHeight="70vh"
          onEventClick={handleEventClick}
          onSlotClick={handleSlotClick}
        />
      </div>
    </Card>
  )
}
