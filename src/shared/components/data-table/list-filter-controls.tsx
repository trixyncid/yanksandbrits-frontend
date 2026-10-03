import { ChevronDown } from 'lucide-react'

import { cn } from '../../lib/cn'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from '../ui/searchable-select'

const filterShellClassName = cn(
  'relative flex h-10 w-full items-center gap-2.5 rounded-full border bg-white pr-8 pl-3.5 text-left shadow-sm transition-colors',
  'hover:border-slate-300',
  'focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-[#253CA1]/20',
  'sm:w-auto',
)

function filterShellState(active: boolean) {
  return active
    ? 'border-[#253CA1]/40 bg-[#F5F7FF]'
    : 'border-slate-200/80'
}

type ListFilterSelectProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  /** Value that means no filter is applied. The control stays quiet until it changes. */
  idleValue?: string
  ariaLabel: string
  className?: string
}

/** Compact dropdown: the category stays visible after a value is chosen. */
export function ListFilterSelect({
  label,
  value,
  onChange,
  options,
  idleValue = '',
  ariaLabel,
  className,
}: ListFilterSelectProps) {
  const active = value !== idleValue

  return (
    <div className={cn(filterShellClassName, filterShellState(active), className)}>
      <span aria-hidden className="shrink-0 text-xs font-medium text-slate-500">
        {label}
      </span>
      <span aria-hidden className="h-4 w-px shrink-0 bg-slate-200" />
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        className="h-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent text-sm font-medium text-slate-800 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value || 'idle'} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  )
}

type ListFilterSearchSelectProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: SearchableSelectOption[]
  idleValue?: string
  disabled?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  ariaLabel: string
  className?: string
}

/** Searchable dropdown for long lists, with the same labeled shell as other filters. */
export function ListFilterSearchSelect({
  label,
  value,
  onChange,
  options,
  idleValue = '',
  disabled = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found',
  ariaLabel,
  className,
}: ListFilterSearchSelectProps) {
  const active = value !== idleValue

  return (
    <SearchableSelect
      leadingLabel={label}
      ariaLabel={ariaLabel}
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      placeholder="All"
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      className={cn(
        'h-10 w-full px-3.5 shadow-sm sm:w-72',
        filterShellState(active),
        className,
      )}
    />
  )
}
