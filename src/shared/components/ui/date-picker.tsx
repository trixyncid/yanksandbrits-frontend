import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import type { Matcher } from 'react-day-picker'

import { cn } from '../../lib/cn'
import { Button } from './button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

type DatePickerProps = {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  align?: 'start' | 'center' | 'end'
  title?: string
  /** Use month/year dropdowns instead of stepping month by month. */
  captionLayout?: 'label' | 'dropdown' | 'dropdown-months' | 'dropdown-years'
  /** First year shown in the year dropdown. */
  fromYear?: number
  /** Last year shown in the year dropdown. */
  toYear?: number
  disabledDays?: Matcher | Matcher[]
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  align = 'end',
  title = 'Select date',
  captionLayout = 'label',
  fromYear,
  toYear,
  disabledDays,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const currentYear = new Date().getFullYear()
  const usesDropdown = captionLayout !== 'label'

  const resolvedFromYear = fromYear ?? (usesDropdown ? currentYear - 100 : undefined)
  const resolvedToYear = toYear ?? (usesDropdown ? currentYear : undefined)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled}
          data-empty={!value}
          className={cn(
            'min-w-48 justify-start text-left font-semibold data-[empty=true]:text-slate-400',
            className,
          )}
        >
          <CalendarIcon className="size-4 text-[#4274B9]" />
          {value ? format(value, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-0">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#4274B9] uppercase">
            {title}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {value ? format(value, 'EEEE, MMM d') : 'Select a day'}
          </p>
        </div>
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
          defaultMonth={value}
          captionLayout={captionLayout}
          startMonth={
            resolvedFromYear != null ? new Date(resolvedFromYear, 0) : undefined
          }
          endMonth={
            resolvedToYear != null ? new Date(resolvedToYear, 11) : undefined
          }
          disabled={disabledDays}
        />
      </PopoverContent>
    </Popover>
  )
}
