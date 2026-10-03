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
              'group relative flex min-w-0 cursor-pointer items-center gap-3.5 rounded-xl px-1.5 py-1.5 pr-2 text-left transition duration-200',
              'hover:bg-[#F5F8FF]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#253CA1]/20',
              calendarOpen && 'bg-[#F5F8FF]',
            )}
          >
            <div
              className={cn(
                'relative flex size-[3.25rem] shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(165deg,#FFFFFF_0%,#E8EEFF_100%)] transition duration-200',
                'ring-1 ring-[#C8D4F5]/90 shadow-[0_1px_2px_rgba(37,60,161,0.06)]',
                'group-hover:shadow-[0_4px_14px_rgba(37,60,161,0.12)] group-hover:ring-[#253CA1]/35',
                calendarOpen &&
                  'shadow-[0_4px_14px_rgba(37,60,161,0.14)] ring-[#253CA1]/45',
              )}
            >
              <span className="absolute inset-x-0 top-0 h-1.5 bg-[#253CA1]" />
              <span className="mt-1 text-[9px] font-semibold tracking-[0.18em] text-[#253CA1]/75">
                {chipMonth}
              </span>
              <span className="text-[1.35rem] font-bold leading-none tracking-tight text-[#1B2A5A]">
                {chipDay}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-lg font-semibold tracking-tight text-[#1B2A5A] sm:text-xl">
                  {monthLabel}
                </p>
                <CalendarDays
                  className={cn(
                    'size-3.5 shrink-0 text-[#253CA1]/35 transition duration-200',
                    'group-hover:text-[#253CA1]/70',
                    calendarOpen && 'text-[#253CA1]',
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
                'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[#253CA1]/45 transition duration-200',
                'group-hover:bg-white group-hover:text-[#253CA1] group-hover:shadow-sm group-hover:ring-1 group-hover:ring-[#C8D4F5]',
                calendarOpen &&
                  'bg-white text-[#253CA1] shadow-sm ring-1 ring-[#C8D4F5]',
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
          <div className="inline-flex items-center overflow-hidden rounded-xl border border-[#C8D4F5] bg-white shadow-sm shadow-[#253CA1]/5">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous day"
              className="inline-flex size-9 items-center justify-center text-[#253CA1] transition-colors hover:bg-[#F5F8FF]"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="h-9 border-x border-[#C8D4F5] px-3 text-sm font-semibold text-[#1B2A5A] transition-colors hover:bg-[#F5F8FF]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next day"
              className="inline-flex size-9 items-center justify-center text-[#253CA1] transition-colors hover:bg-[#F5F8FF]"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {canAdd && onAdd ? (
            <Button
              onClick={onAdd}
              className="h-9 rounded-full bg-[#253CA1] px-3.5 text-white hover:bg-[#1f3190]"
            >
              <Plus className="size-4" />
              Add Schedule
            </Button>
          ) : null}
        </div>
      </div>

      <PopoverContent
        align="start"
        className="w-auto overflow-hidden rounded-2xl border-[#C8D4F5] p-0 shadow-lg shadow-[#253CA1]/10"
      >
        <div className="border-b border-[#E8EEFF] bg-[linear-gradient(135deg,#E8EEFF_0%,#FFFFFF_70%)] px-3 py-2.5">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#253CA1]/60 uppercase">
            Jump to date
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#1B2A5A]">
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
