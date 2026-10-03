import {
  format,
  isSameMonth,
  parseISO,
  startOfDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
} from 'react'
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from 'react-day-picker'

import { cn } from '../../../shared/lib/cn'
import { DashboardPanel } from '../../admin/components/dashboard-section'
import type { TutorDaySession } from '../lib/map-tutor-day-sessions'

export type TutorMonthDayMarker = {
  dateKey: string
  count: number
}

type TutorMonthCalendarProps = {
  selected: Date
  month: Date
  onSelect: (date: Date) => void
  onMonthChange: (month: Date) => void
  markers: TutorMonthDayMarker[]
  className?: string
}

function CalendarDayButton({
  className,
  day,
  markers,
  modifiers,
  ...props
}: ComponentProps<typeof DayButton> & {
  markers: Map<string, TutorMonthDayMarker>
}) {
  const defaultClassNames = getDefaultClassNames()
  const ref = useRef<HTMLButtonElement>(null)
  const dateKey = format(day.date, 'yyyy-MM-dd')
  const marker = markers.get(dateKey)
  const hasSessions = Boolean(marker && marker.count > 0)
  const selected = Boolean(
    modifiers.selected &&
      !modifiers.range_start &&
      !modifiers.range_end &&
      !modifiers.range_middle,
  )
  const isToday = Boolean(modifiers.today)

  useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus()
    }
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      {...props}
      data-day={day.date.toLocaleDateString()}
      data-selected-single={selected ? 'true' : 'false'}
      data-today={!selected && isToday ? 'true' : 'false'}
      className={cn(
        'relative mx-auto flex size-[1.75rem] flex-col items-center justify-center rounded-full border border-transparent bg-transparent text-[11px] leading-none font-medium text-slate-800 transition-colors duration-150',
        'hover:bg-slate-100/70',
        'data-[today=true]:border-[#253CA1] data-[today=true]:font-semibold data-[today=true]:text-[#253CA1]',
        'data-[selected-single=true]:border-transparent data-[selected-single=true]:bg-[#253CA1] data-[selected-single=true]:font-semibold data-[selected-single=true]:text-white',
        'data-[selected-single=true]:hover:bg-[#1f3190] data-[selected-single=true]:hover:text-white',
        'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-[#253CA1]/25',
        defaultClassNames.day,
        className,
        selected &&
          '!border-transparent !bg-[#253CA1] !font-semibold !text-white hover:!bg-[#1f3190] hover:!text-white',
      )}
    >
      <span
        className={cn(
          'tabular-nums',
          hasSessions && 'translate-y-[-1px]',
          selected && 'text-white',
        )}
      >
        {format(day.date, 'd')}
      </span>
      <span
        className={cn(
          'absolute bottom-[2px] size-[3px] rounded-full',
          hasSessions
            ? selected
              ? 'bg-white'
              : 'bg-[#253CA1]'
            : 'bg-transparent',
        )}
        aria-hidden
      />
    </button>
  )
}

export function buildTutorMonthMarkers(
  sessions: TutorDaySession[],
): TutorMonthDayMarker[] {
  const byDay = new Map<string, TutorMonthDayMarker>()

  for (const session of sessions) {
    if (!session.dateKey || session.status === 'cancelled') continue
    const existing = byDay.get(session.dateKey)
    if (!existing) {
      byDay.set(session.dateKey, { dateKey: session.dateKey, count: 1 })
      continue
    }
    existing.count += 1
  }

  return [...byDay.values()]
}

export function TutorMonthCalendar({
  selected,
  month,
  onSelect,
  onMonthChange,
  markers,
  className,
}: TutorMonthCalendarProps) {
  const defaultClassNames = getDefaultClassNames()
  const selectedDay = startOfDay(selected)
  const markerMap = useMemo(() => {
    const map = new Map<string, TutorMonthDayMarker>()
    for (const marker of markers) {
      map.set(marker.dateKey, marker)
    }
    return map
  }, [markers])

  const daysWithSessions = useMemo(
    () =>
      markers
        .map((marker) => {
          try {
            return parseISO(marker.dateKey)
          } catch {
            return null
          }
        })
        .filter((date): date is Date => Boolean(date)),
    [markers],
  )

  return (
    <DashboardPanel
      variant="plump"
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 fill-mode-both p-3 sm:p-3.5 [animation-delay:80ms]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold tracking-tight text-slate-900">
          {format(month, 'MMMM yyyy')}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() =>
              onMonthChange(
                new Date(month.getFullYear(), month.getMonth() - 1, 1),
              )
            }
            className="inline-flex size-6 items-center justify-center rounded-full bg-[#EEF2F6] text-slate-600 transition hover:bg-[#E4EAF1] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#253CA1]/30"
          >
            <ChevronLeft className="size-3.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() =>
              onMonthChange(
                new Date(month.getFullYear(), month.getMonth() + 1, 1),
              )
            }
            className="inline-flex size-6 items-center justify-center rounded-full bg-[#EEF2F6] text-slate-600 transition hover:bg-[#E4EAF1] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#253CA1]/30"
          >
            <ChevronRight className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-2 border-t border-slate-200/80 pt-2">
        <DayPicker
          mode="single"
          month={month}
          onMonthChange={onMonthChange}
          selected={selectedDay}
          onSelect={(date) => {
            if (!date) return
            onSelect(startOfDay(date))
          }}
          showOutsideDays={false}
          modifiers={{ hasSession: daysWithSessions }}
          className="w-full [--cell-size:1.85rem]"
          classNames={{
            root: cn('w-full', defaultClassNames.root),
            months: cn('flex w-full flex-col', defaultClassNames.months),
            month: cn('flex w-full flex-col gap-0.5', defaultClassNames.month),
            nav: 'hidden',
            month_caption: 'hidden',
            month_grid: cn(
              'w-full border-collapse',
              defaultClassNames.month_grid,
            ),
            weekdays: cn('mb-0.5 flex', defaultClassNames.weekdays),
            weekday: cn(
              'flex-1 select-none text-center text-[10px] font-medium text-slate-400',
              defaultClassNames.weekday,
            ),
            week: cn(
              'mt-1 flex w-full items-center rounded-full py-0.5',
              defaultClassNames.week,
            ),
            day: cn(
              'group/day relative flex h-(--cell-size) w-full items-center justify-center select-none p-0 text-center',
              defaultClassNames.day,
            ),
            today: defaultClassNames.today,
            outside: cn(
              'text-slate-300 opacity-40 [&_button]:text-slate-300',
              defaultClassNames.outside,
            ),
            selected: defaultClassNames.selected,
          }}
          components={{
            DayButton: (props) => (
              <CalendarDayButton {...props} markers={markerMap} />
            ),
          }}
          formatters={{
            formatWeekdayName: (date) => format(date, 'EEEEEE'),
          }}
        />
      </div>

      {!isSameMonth(selectedDay, month) ? (
        <p className="mt-1.5 text-center text-[10px] text-slate-400">
          Selected {format(selectedDay, 'd MMM')}
        </p>
      ) : null}
    </DashboardPanel>
  )
}
