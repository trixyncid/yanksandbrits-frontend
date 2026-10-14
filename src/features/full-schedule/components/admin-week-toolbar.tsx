import { addDays, format, startOfDay } from 'date-fns'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { Calendar } from '../../../shared/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/components/ui/popover'
import { cn } from '../../../shared/lib/cn'

type AdminWeekToolbarProps = {
  selectedDate: Date
  onDateChange: (date: Date) => void
  canAdd?: boolean
  onAdd?: () => void
  className?: string
}

export function AdminWeekToolbar({
  selectedDate,
  onDateChange,
  canAdd = false,
  onAdd,
  className,
}: AdminWeekToolbarProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const day = startOfDay(selectedDate)
  const monthLabel = format(day, 'MMMM yyyy')
  const weekdayLabel = format(day, 'EEEE')
  const chipMonth = format(day, 'MMM').toUpperCase()
  const chipDay = format(day, 'd')

  function goToday() {
    onDateChange(startOfDay(new Date()))
  }

  function goPrev() {
    onDateChange(addDays(day, -1))
  }

  function goNext() {
    onDateChange(addDays(day, 1))
  }

  function selectDate(date: Date | undefined) {
    if (!date) return
    onDateChange(startOfDay(date))
    setCalendarOpen(false)
  }

  return (
    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
      <div
        className={cn(
          'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
          className,
        )}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Open calendar to pick a date"
            aria-haspopup="dialog"
            aria-expanded={calendarOpen}
            title="Jump to a date"
            className={cn(
              'group relative flex min-w-0 cursor-pointer items-center gap-3.5 rounded-full py-1.5 pr-3 pl-1.5 text-left transition duration-200',
              'hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20',
              calendarOpen && 'bg-canvas',
            )}
          >
            <div
              className={cn(
                'relative flex size-[3.25rem] shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl bg-brand-50 transition duration-200',
                'ring-1 ring-brand-100',
                'group-hover:shadow-md group-hover:shadow-brand-500/15 group-hover:ring-brand-500/35',
                calendarOpen && 'shadow-md shadow-brand-500/15 ring-brand-500/45',
              )}
            >
              <span className="absolute inset-x-0 top-0 h-1.5 bg-brand-500" />
              <span className="mt-1 text-[9px] font-semibold tracking-[0.18em] text-brand-500/75">
                {chipMonth}
              </span>
              <span className="text-[1.35rem] font-bold leading-none tracking-tight text-brand-800">
                {chipDay}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-lg font-bold tracking-tight text-ink sm:text-xl">
                  {monthLabel}
                </p>
                <CalendarDays
                  className={cn(
                    'size-3.5 shrink-0 text-brand-500/35 transition duration-200',
                    'group-hover:text-brand-500/70',
                    calendarOpen && 'text-brand-500',
                  )}
                  aria-hidden
                />
              </div>
              <p className="mt-0.5 truncate text-sm text-slate-500">
                {weekdayLabel}
                <span className="mx-1.5 text-slate-300">·</span>
                {format(day, 'MMM d, yyyy')}
              </p>
            </div>

            <span
              className={cn(
                'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-brand-500/45 transition duration-200',
                'group-hover:bg-white group-hover:text-brand-500 group-hover:shadow-sm group-hover:ring-1 group-hover:ring-brand-200',
                calendarOpen &&
                  'bg-white text-brand-500 shadow-sm ring-1 ring-brand-200',
              )}
              aria-hidden
            >
              <ChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-200',
                  calendarOpen && 'rotate-180',
                )}
              />
            </span>
          </button>
        </PopoverTrigger>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full bg-canvas p-1">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous day"
              title="Previous day"
              className="inline-flex size-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-white"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="h-9 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-ink hover:text-white"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next day"
              title="Next day"
              className="inline-flex size-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-white"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {canAdd && onAdd ? (
            <Button onClick={onAdd} className="h-11 px-4">
              <Plus className="size-4" />
              Book a session
            </Button>
          ) : null}
        </div>
      </div>

      <PopoverContent
        align="start"
        className="w-auto overflow-hidden rounded-3xl border-transparent p-0 shadow-lg shadow-ink/15"
      >
        <div className="bg-brand-50 px-4 py-3">
          <p className="text-[11px] font-bold tracking-[0.14em] text-brand-700 uppercase">
            Jump to date
          </p>
          <p className="mt-0.5 text-sm font-semibold text-ink">
            {format(day, 'EEEE, MMM d, yyyy')}
          </p>
        </div>
        <Calendar
          mode="single"
          selected={day}
          defaultMonth={day}
          onSelect={selectDate}
        />
      </PopoverContent>
    </Popover>
  )
}
