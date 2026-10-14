import { cn } from '../../lib/cn'
import { DropdownSelect } from '../ui/dropdown-select'
import {
  SearchableSelect,
  type SearchableSelectOption,
} from '../ui/searchable-select'

function filterShellState(active: boolean) {
  return active
    ? 'border-brand-200 bg-brand-50'
    : 'border-transparent bg-canvas hover:bg-canvas-deep'
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
  return (
    <DropdownSelect
      variant="chip"
      leadingLabel={label}
      ariaLabel={ariaLabel}
      value={value}
      active={value !== idleValue}
      options={options}
      onValueChange={onChange}
      className={className}
    />
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
