import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useEffect, useRef, type ComponentProps } from 'react'
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type DayPickerProps,
} from 'react-day-picker'

import { cn } from '../../lib/cn'

type CalendarProps = DayPickerProps

const navButtonClassName =
  'inline-flex size-(--cell-size) items-center justify-center rounded-xl border-0 bg-transparent p-0 text-slate-500 transition-colors select-none hover:bg-[#EDF4FF] hover:text-[#2F5A94] aria-disabled:opacity-50'

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus()
    }
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'flex aspect-square size-auto w-full min-w-(--cell-size) flex-col items-center justify-center gap-1 rounded-xl border-0 bg-transparent text-sm leading-none font-medium text-slate-700 transition-colors',
        'hover:bg-[#EDF4FF] hover:text-[#2F5A94]',
        'data-[selected-single=true]:bg-[#4274B9] data-[selected-single=true]:text-white data-[selected-single=true]:hover:bg-[#2F5A94] data-[selected-single=true]:hover:text-white',
        'data-[range-start=true]:bg-[#4274B9] data-[range-start=true]:text-white',
        'data-[range-end=true]:bg-[#4274B9] data-[range-end=true]:text-white',
        'data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-[#EDF4FF] data-[range-middle=true]:text-[#2F5A94]',
        'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-[#4274B9]/35',
        '[&>span]:text-[10px] [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  formatters,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'group/calendar bg-white p-3 [--cell-size:2.4rem]',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn(
          'relative flex flex-col gap-4 md:flex-row',
          defaultClassNames.months,
        ),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          navButtonClassName,
          defaultClassNames.button_previous,
        ),
        button_next: cn(navButtonClassName, defaultClassNames.button_next),
        month_caption: cn(
          'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          'relative rounded-xl border border-slate-200 shadow-sm has-focus:border-[#4274B9] has-focus:ring-2 has-focus:ring-[#4274B9]/20',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn(
          'absolute inset-0 bg-white opacity-0',
          defaultClassNames.dropdown,
        ),
        caption_label: cn(
          'select-none font-semibold text-slate-800',
          captionLayout === 'label'
            ? 'text-sm'
            : 'flex h-8 items-center gap-1 rounded-xl pr-1 pl-2 text-sm [&>svg]:size-3.5 [&>svg]:text-slate-400',
          defaultClassNames.caption_label,
        ),
        month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'flex-1 select-none rounded-xl text-[0.75rem] font-semibold tracking-wide text-slate-400 uppercase',
          defaultClassNames.weekday,
        ),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn(
          'w-(--cell-size) select-none',
          defaultClassNames.week_number_header,
        ),
        week_number: cn(
          'select-none text-[0.8rem] text-slate-400',
          defaultClassNames.week_number,
        ),
        day: cn(
          'group/day relative aspect-square h-full w-full select-none p-0 text-center',
          defaultClassNames.day,
        ),
        range_start: cn('rounded-l-xl bg-[#EDF4FF]', defaultClassNames.range_start),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('rounded-r-xl bg-[#EDF4FF]', defaultClassNames.range_end),
        today: cn(
          'rounded-xl bg-[#EDF4FF] text-[#2F5A94]',
          defaultClassNames.today,
        ),
        outside: cn(
          'text-slate-300 aria-selected:text-slate-300',
          defaultClassNames.outside,
        ),
        disabled: cn(
          'text-slate-300 opacity-50',
          defaultClassNames.disabled,
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className: rootClassName, rootRef, ...rootProps }) => (
          <div
            data-slot="calendar"
            ref={rootRef}
            className={cn(rootClassName)}
            {...rootProps}
          />
        ),
        Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeftIcon
                className={cn('size-4', chevronClassName)}
                {...chevronProps}
              />
            )
          }

          if (orientation === 'right') {
            return (
              <ChevronRightIcon
                className={cn('size-4', chevronClassName)}
                {...chevronProps}
              />
            )
          }

          return (
            <ChevronDownIcon
              className={cn('size-4', chevronClassName)}
              {...chevronProps}
            />
          )
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

export { CalendarDayButton }
