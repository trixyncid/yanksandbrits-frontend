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
  /** Show a Clear action in the popup. Defaults to true. */
  clearable?: boolean
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
  clearable = true,
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

  function clearDate() {
    onChange?.(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="md"
          disabled={disabled}
          data-empty={!value}
          className={cn(
            'h-11 min-w-0 justify-start rounded-full border-slate-200/80 bg-white text-left font-medium text-[#1B2A5A] shadow-sm',
            'hover:border-slate-300 hover:bg-white',
            'data-[empty=true]:font-normal data-[empty=true]:text-slate-400',
            'focus-visible:ring-[#253CA1]/20',
            open && 'border-slate-300 ring-2 ring-[#253CA1]/20',
            className,
          )}
        >
          <CalendarIcon className="size-4 text-[#253CA1]" />
          {value ? format(value, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-auto overflow-hidden rounded-2xl border-[#C8D4F5] p-0 shadow-lg shadow-[#253CA1]/10"
      >
        <div className="border-b border-[#E8EEFF] bg-[linear-gradient(135deg,#E8EEFF_0%,#FFFFFF_70%)] px-4 py-3">
          <p className="text-xs font-semibold tracking-[0.14em] text-[#253CA1]/60 uppercase">
            {title}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#1B2A5A]">
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
        {clearable ? (
          <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/80 px-3 py-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!value}
              onClick={clearDate}
              className="h-8 rounded-full px-3 text-slate-500 hover:bg-white hover:text-slate-800"
            >
              Clear date
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
