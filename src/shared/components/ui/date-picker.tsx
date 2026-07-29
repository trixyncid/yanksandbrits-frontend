import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'

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
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  align = 'end',
  title = 'Select date',
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

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
        />
      </PopoverContent>
    </Popover>
  )
}
