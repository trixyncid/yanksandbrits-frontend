import { format, isSameMonth, parseISO, startOfDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef, type ComponentProps } from 'react'
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from 'react-day-picker'

import { cn } from '../../../shared/lib/cn'
import { DashboardPanel } from '../../admin/components/dashboard-section'
import type { TutorMonthDayMarker } from '../lib/tutor-month-markers'

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
        'hover:bg-canvas',
        'data-[today=true]:border-brand-500 data-[today=true]:font-semibold data-[today=true]:text-brand-500',
        'data-[selected-single=true]:border-transparent data-[selected-single=true]:bg-brand-500 data-[selected-single=true]:font-semibold data-[selected-single=true]:text-white',
        'data-[selected-single=true]:hover:bg-brand-600 data-[selected-single=true]:hover:text-white',
        'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-brand-500/25',
        defaultClassNames.day,
        className,
        selected &&
          '!border-transparent !bg-brand-500 !font-semibold !text-white hover:!bg-brand-600 hover:!text-white',
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
              : 'bg-brand-500'
            : 'bg-transparent',
        )}
        aria-hidden
      />
    </button>
  )
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
        <p className="text-base font-bold tracking-tight text-ink">
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
            className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
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
            className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
          >
            <ChevronRight className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-3xl bg-canvas/60 p-2">
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
