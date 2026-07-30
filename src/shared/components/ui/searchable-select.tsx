import { Check, ChevronDown, Search, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { cn } from '../../lib/cn'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export type SearchableSelectOption = {
  value: string
  label: string
  keywords?: string
}

type SearchableSelectProps = {
  id?: string
  value: string
  options: SearchableSelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  clearable?: boolean
  className?: string
  align?: 'start' | 'center' | 'end'
}

export function SearchableSelect({
  id,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found',
  disabled = false,
  clearable = false,
  className,
  align = 'start',
}: SearchableSelectProps) {
  const listId = useId()
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return options
    }

    return options.filter((option) => {
      const haystack = `${option.label} ${option.keywords ?? ''}`.toLowerCase()
      return haystack.includes(needle)
    })
  }, [options, query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }

    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  function selectOption(nextValue: string) {
    onChange(nextValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          data-empty={!selected}
          className={cn(
            'flex h-12 w-full items-center gap-2 rounded-xl border border-slate-200 bg-[#F4F6FA] px-4 text-left text-sm font-medium text-slate-700 shadow-sm transition-colors',
            'hover:border-[#BED2F2] hover:bg-white',
            'focus:border-[#4274B9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4274B9]/15',
            'disabled:cursor-not-allowed disabled:opacity-60',
            'data-[empty=true]:text-slate-400',
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate">
            {selected?.label ?? placeholder}
          </span>
          {clearable && value ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200/70 hover:text-slate-600"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onChange('')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  event.stopPropagation()
                  onChange('')
                }
              }}
            >
              <X className="size-3.5" />
            </span>
          ) : null}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0 text-slate-400 transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-[var(--radix-popover-trigger-width)] overflow-hidden p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2.5">
          <Search className="size-4 shrink-0 text-slate-400" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            aria-autocomplete="list"
            aria-controls={listId}
          />
        </div>
        <ul
          id={listId}
          role="listbox"
          className="max-h-56 overflow-y-auto p-1.5"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-slate-400">
              {emptyMessage}
            </li>
          ) : (
            filtered.map((option) => {
              const isSelected = option.value === value
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-[#F0F5FC] font-semibold text-[#2F5A94]'
                        : 'text-slate-700 hover:bg-slate-50',
                    )}
                    onClick={() => selectOption(option.value)}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>
                    {isSelected ? (
                      <Check className="size-4 shrink-0 text-[#4274B9]" />
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
