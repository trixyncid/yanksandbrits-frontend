import { Search, X } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'

type DataTableToolbarProps = {
  title?: string
  description?: string
  totalCount: number
  totalLabel?: string
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  /** Page-level primary actions (e.g. Add). Sit with the title. */
  actions?: ReactNode
  /** Discovery filters. Sit with search in the tools row. */
  filters?: ReactNode
  variant?: 'default' | 'glass'
  /** `pill` matches Steadi-style capsule inputs (icon + rounded-full). */
  searchVariant?: 'default' | 'pill'
}

export function DataTableToolbar({
  title,
  description,
  totalCount,
  totalLabel = 'records',
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  actions,
  filters,
  variant = 'default',
  searchVariant = 'default',
}: DataTableToolbarProps) {
  const isGlass = variant === 'glass'
  const isPillSearch = searchVariant === 'pill'

  if (!isGlass) {
    return (
      <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? (
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            ) : null}
            <p className="mt-2 text-xs font-medium text-slate-400">
              Now showing:{' '}
              <span className="font-semibold text-slate-700">
                {totalCount} {totalLabel}
              </span>
            </p>
          </div>

          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>

        {/* Search is the primary control. Filters wrap in their own group so a long set does not shove search aside. */}
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start">
          <SearchField
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            variant={searchVariant}
            className="w-full sm:w-full lg:w-80 lg:shrink-0"
          />
          {filters ? (
            <div className="min-w-0 w-full lg:w-auto lg:flex-1">{filters}</div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-[#D7E4F6]/80">
      {/* Identity + primary action */}
      <div className="flex flex-col gap-3 px-4 pt-3.5 pb-3 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          {title ? (
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              {title}
            </h2>
          ) : null}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {description ? (
              <p className="text-sm text-slate-500">{description}</p>
            ) : null}
            <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-[#C8D4F5]/70 backdrop-blur-sm">
              {totalCount} {totalLabel}
            </span>
          </div>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">
            {actions}
          </div>
        ) : null}
      </div>

      {/* Discovery tools: search + filters */}
      <div className="flex flex-col gap-2 border-t border-[#D7E4F6]/70 bg-[linear-gradient(180deg,rgba(248,251,255,0.55)_0%,rgba(255,255,255,0.15)_100%)] px-4 py-2.5 sm:flex-row sm:items-center sm:px-5">
        <SearchField
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          variant={isPillSearch ? 'pill' : 'default'}
          className="w-full sm:w-72"
          inputClassName={
            isPillSearch
              ? undefined
              : 'h-9 border-white/80 bg-white/90 shadow-sm backdrop-blur-md'
          }
        />
        {filters ? (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        ) : null}
      </div>
    </div>
  )
}

function SearchField({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  variant = 'default',
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  inputClassName?: string
  variant?: 'default' | 'pill'
}) {
  const isPill = variant === 'pill'

  return (
    <div className={cn('relative w-full sm:w-72', className)}>
      <Search
        className={cn(
          'pointer-events-none absolute top-1/2 z-10 size-3.5 -translate-y-1/2',
          isPill
            ? 'left-3.5 size-4 text-slate-700'
            : 'left-2.5 text-slate-500',
        )}
        aria-hidden
        strokeWidth={2}
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search table"
        className={cn(
          isPill
            ? cn(
                'box-border h-10 w-full rounded-full border border-slate-200/80 bg-white py-0 text-sm font-medium text-slate-800 shadow-sm',
                'placeholder:font-normal placeholder:text-slate-400',
                'transition-colors hover:border-slate-300',
                'focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#253CA1]/20',
                'pl-10',
                value ? 'pr-9' : 'pr-4',
              )
            : cn(
                'box-border h-11 w-full rounded-full border border-slate-200/80 bg-white py-0 text-sm font-medium text-slate-800 shadow-sm',
                'placeholder:font-normal placeholder:text-slate-400',
                'transition-colors hover:border-slate-300',
                'focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#253CA1]/20',
                'pl-8',
                value ? 'pr-9' : 'pr-3',
              ),
          inputClassName,
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 z-10 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  )
}
