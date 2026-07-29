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
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const label = formatRangeLabel(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          data-empty={!label}
          className={cn(
            'h-11 min-w-64 justify-start text-left font-semibold data-[empty=true]:text-slate-400',
            className,
          )}
        >
          <CalendarIcon className="size-4 text-[#4274B9]" />
          {label ?? <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-0">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#4274B9] uppercase">
            Date range
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
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
      </PopoverContent>
    </Popover>
  )
}
