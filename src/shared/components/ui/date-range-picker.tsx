import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { cn } from '../../lib/cn'
import { Button } from './button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

type DateRangePickerProps = {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  align?: 'start' | 'center' | 'end'
  /** Show a Clear action in the popup. Defaults to true. */
  clearable?: boolean
}

function formatRangeLabel(range: DateRange | undefined) {
  if (!range?.from) {
    return null
  }

  if (!range.to) {
    return format(range.from, 'LLL d, yyyy')
  }

  return `${format(range.from, 'LLL d, yyyy')} - ${format(range.to, 'LLL d, yyyy')}`
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
  disabled = false,
  className,
  align = 'start',
  clearable = true,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const label = formatRangeLabel(value)

  function clearRange() {
    onChange?.(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          data-empty={!label}
          className={cn(
            'h-11 min-w-64 justify-start rounded-full border-transparent bg-canvas/70 text-left font-medium text-ink hover:bg-canvas',
            'hover:border-slate-300 hover:bg-white',
            'data-[empty=true]:font-normal data-[empty=true]:text-slate-400',
            'focus-visible:ring-brand-500/20',
            open && 'border-slate-300 ring-2 ring-brand-500/20',
            className,
          )}
        >
          <CalendarIcon className="size-4 text-brand-500" />
          {label ?? <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-auto overflow-hidden rounded-2xl border-brand-200 p-0 shadow-lg shadow-brand-500/10"
      >
        <div className="border-b border-brand-100 bg-[linear-gradient(135deg,#DCE2F6_0%,#FFFFFF_70%)] px-4 py-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-brand-500/60 uppercase">
            Date range
          </p>
          <p className="mt-1 text-sm font-semibold text-brand-800">
            {label ?? 'Select start and end dates'}
          </p>
        </div>
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          defaultMonth={value?.from}
        />
        {clearable ? (
          <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/80 px-3 py-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!value?.from}
              onClick={clearRange}
              className="h-8 rounded-full px-3 text-slate-500 hover:bg-white hover:text-slate-800"
            >
              Clear dates
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
