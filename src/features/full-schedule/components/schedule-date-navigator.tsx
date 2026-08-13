import {
  addDays,
  addWeeks,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/components/ui/button'
import { Calendar } from '../../../shared/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/components/ui/popover'

type ScheduleDateNavigatorProps = {
  value: Date
  onChange: (date: Date) => void
  sessionCount?: number
  className?: string
}

function relativeDayLabel(date: Date, today: Date) {
  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, addDays(today, -1))) return 'Yesterday'
  if (isSameDay(date, addDays(today, 1))) return 'Tomorrow'
  return format(date, 'EEEE')
}

export function ScheduleDateNavigator({
  value,
  onChange,
  sessionCount,
  className,
}: ScheduleDateNavigatorProps) {
  const [jumpOpen, setJumpOpen] = useState(false)
  const today = startOfDay(new Date())
  const selected = startOfDay(value)
  const viewingToday = isSameDay(selected, today)

  const weekStart = startOfWeek(selected, { weekStartsOn: 1 })
  const weekDays = useMemo(
    () =>
      eachDayOfInterval({
        start: weekStart,
        end: addDays(weekStart, 6),
      }),
    [weekStart],
  )

  const weekLabel = `${format(weekDays[0]!, 'MMM d')} – ${format(weekDays[6]!, 'MMM d, yyyy')}`
  const relative = relativeDayLabel(selected, today)

  return (
    <section
      className={cn(
        'overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-[linear-gradient(180deg,#F8FBFF_0%,#FFFFFF_42%)]',
        className,
      )}
      aria-label="Schedule date"
    >
      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#4274B9] uppercase">
              Viewing day
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
                {format(selected, 'EEEE, MMMM d')}
              </h3>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  viewingToday
                    ? 'bg-[#EDF4FF] text-[#2F5A94]'
                    : 'bg-slate-100 text-slate-600',
                )}
              >
                {relative}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Week of {weekLabel}
              {typeof sessionCount === 'number' ? (
                <>
                  <span className="mx-1.5 text-slate-300">·</span>
                  <span className="font-medium text-slate-700 tabular-nums">
                    {sessionCount} session{sessionCount === 1 ? '' : 's'}
                  </span>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!viewingToday ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onChange(today)}
                className="shadow-sm"
              >
                Jump to today
              </Button>
            ) : null}

            <Popover open={jumpOpen} onOpenChange={setJumpOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Jump to date"
                  className="shadow-sm"
                >
                  <CalendarDays className="size-4 text-[#4274B9]" />
                  Calendar
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-xs font-semibold tracking-[0.14em] text-[#4274B9] uppercase">
                    Jump to date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {format(selected, 'EEEE, MMM d, yyyy')}
                  </p>
                </div>
                <Calendar
                  mode="single"
                  selected={selected}
                  defaultMonth={selected}
                  onSelect={(date) => {
                    if (!date) return
                    onChange(startOfDay(date))
                    setJumpOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-stretch gap-2">
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => onChange(addWeeks(selected, -1))}
            className="inline-flex size-10 shrink-0 items-center justify-center self-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#BED2F2] hover:bg-[#EDF4FF] hover:text-[#2F5A94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4274B9]/35"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div
            role="listbox"
            aria-label="Days this week"
            className="grid min-w-0 flex-1 grid-cols-7 gap-1 sm:gap-1.5"
          >
            {weekDays.map((day) => {
              const selectedDay = isSameDay(day, selected)
              const dayIsToday = isToday(day)

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  role="option"
                  aria-selected={selectedDay}
                  aria-label={format(day, 'EEEE, MMMM d, yyyy')}
                  onClick={() => onChange(startOfDay(day))}
                  className={cn(
                    'group relative flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2 transition duration-200 sm:min-h-[4.75rem]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4274B9]/35 focus-visible:ring-offset-2',
                    selectedDay
                      ? 'scale-[1.02] border-transparent bg-gradient-to-b from-[#5A8BC9] via-[#4274B9] to-[#2F5A94] text-white shadow-lg shadow-[#4274B9]/25'
                      : 'border-slate-200/80 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:shadow-sm',
                  )}
                >
                  <span
                    className={cn(
                      'text-[10px] font-semibold tracking-[0.12em] uppercase sm:text-[11px]',
                      selectedDay ? 'text-white/80' : 'text-slate-400',
                    )}
                  >
                    {format(day, 'EEE')}
                  </span>
                  <span
                    className={cn(
                      'text-lg font-bold tabular-nums sm:text-xl',
                      selectedDay ? 'text-white' : 'text-slate-900',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  <span
                    className={cn(
                      'size-1.5 rounded-full transition',
                      dayIsToday
                        ? selectedDay
                          ? 'bg-white'
                          : 'bg-[#4274B9]'
                        : 'bg-transparent',
                    )}
                    aria-hidden
                  />
                </button>
              )
            })}
          </div>

          <button
            type="button"
            aria-label="Next week"
            onClick={() => onChange(addWeeks(selected, 1))}
            className="inline-flex size-10 shrink-0 items-center justify-center self-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#BED2F2] hover:bg-[#EDF4FF] hover:text-[#2F5A94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4274B9]/35"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 sm:hidden">
          <button
            type="button"
            aria-label="Previous day"
            onClick={() => onChange(addDays(selected, -1))}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ChevronLeft className="size-3.5" />
            Prev day
          </button>
          <button
            type="button"
            aria-label="Next day"
            onClick={() => onChange(addDays(selected, 1))}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Next day
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
