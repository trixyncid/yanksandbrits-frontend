import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

import { cn } from '../../lib/cn'

export type DropdownOption = {
  value: string
  label: ReactNode
  /** Plain text used for type-to-jump and the closed trigger's title. */
  text?: string
  description?: string
  disabled?: boolean
}

type DropdownSelectProps = {
  id?: string
  value: string
  options: DropdownOption[]
  onValueChange: (value: string) => void
  /** Shown when no option matches `value`. */
  placeholder?: string
  disabled?: boolean
  ariaLabel?: string
  /**
   * `field`: full-width form control. `chip`: compact list filter with a
   * leading label. `pill`: compact standalone control (e.g. a period picker).
   */
  variant?: 'field' | 'chip' | 'pill'
  /** Category label shown inside a `chip` trigger, e.g. "Status". */
  leadingLabel?: string
  leadingIcon?: LucideIcon
  /** Highlights a `chip` once it filters something. */
  active?: boolean
  className?: string
  align?: 'start' | 'center' | 'end'
}

function optionText(option: DropdownOption) {
  if (option.text) return option.text
  return typeof option.label === 'string' || typeof option.label === 'number'
    ? String(option.label)
    : option.value
}

/**
 * Brand-styled replacement for the native <select>: a button that opens a
 * listbox. Keyboard: arrows/Home/End move, typing jumps, Enter/Space picks,
 * Escape closes.
 */
export function DropdownSelect({
  id,
  value,
  options,
  onValueChange,
  placeholder = 'Select...',
  disabled = false,
  ariaLabel,
  variant = 'field',
  leadingLabel,
  leadingIcon: LeadingIcon,
  active = false,
  className,
  align = 'start',
}: DropdownSelectProps) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listRef = useRef<HTMLDivElement>(null)
  const typeahead = useRef({ text: '', at: 0 })

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  )
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined
  // An empty-value option ("All", "Select a branch") reads as a placeholder.
  const showsPlaceholder = !selected || selected.value === ''

  function firstEnabled(from: number, step: 1 | -1) {
    for (
      let index = from;
      index >= 0 && index < options.length;
      index += step
    ) {
      if (!options[index].disabled) return index
    }
    return -1
  }

  function openList() {
    if (disabled) return
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabled(0, 1))
    setOpen(true)
  }

  function choose(index: number) {
    const option = options[index]
    if (!option || option.disabled) return
    setOpen(false)
    if (option.value !== value) onValueChange(option.value)
  }

  useEffect(() => {
    if (!open || activeIndex < 0) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  function jumpByTyping(key: string) {
    const now = Date.now()
    const state = typeahead.current
    state.text = now - state.at > 600 ? key : state.text + key
    state.at = now
    const needle = state.text.toLowerCase()
    const start = Math.max(activeIndex, 0)
    const ordered = [...options.slice(start + 1), ...options.slice(0, start + 1)]
    const match = ordered.find(
      (option) =>
        !option.disabled && optionText(option).toLowerCase().startsWith(needle),
    )
    if (match) setActiveIndex(options.indexOf(match))
  }

  function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = firstEnabled(activeIndex + 1, 1)
      if (next >= 0) setActiveIndex(next)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      const next = firstEnabled(activeIndex - 1, -1)
      if (next >= 0) setActiveIndex(next)
    } else if (event.key === 'Home') {
      event.preventDefault()
      setActiveIndex(firstEnabled(0, 1))
    } else if (event.key === 'End') {
      event.preventDefault()
      setActiveIndex(firstEnabled(options.length - 1, -1))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      choose(activeIndex)
    } else if (event.key === 'Tab') {
      setOpen(false)
    } else if (event.key.length === 1 && /\S/.test(event.key)) {
      jumpByTyping(event.key)
    }
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      openList()
    }
  }

  const triggerLabel = showsPlaceholder
    ? (selected?.label ?? placeholder)
    : selected.label

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => (next ? openList() : setOpen(false))}
    >
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={
            ariaLabel ?? (leadingLabel ? `${leadingLabel}: ${selected ? optionText(selected) : placeholder}` : undefined)
          }
          title={selected ? optionText(selected) : undefined}
          disabled={disabled}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            'group relative flex min-w-0 items-center gap-2.5 rounded-full text-left text-sm font-medium transition outline-none',
            'focus-visible:ring-4 focus-visible:ring-brand-500/10',
            'disabled:cursor-not-allowed disabled:opacity-60',
            variant === 'field' &&
              'h-11 w-full border border-transparent bg-canvas/70 pr-10 pl-4 text-ink hover:bg-canvas focus-visible:border-brand-300 focus-visible:bg-white',
            variant === 'chip' &&
              cn(
                'h-10 w-full border pr-8 pl-3.5 sm:w-auto',
                active
                  ? 'border-brand-200 bg-brand-50 text-ink'
                  : 'border-transparent bg-canvas text-ink hover:bg-canvas-deep',
              ),
            variant === 'pill' &&
              'h-10 max-w-full border border-transparent bg-white pr-9 pl-3.5 text-ink shadow-sm ring-1 ring-slate-200/70 hover:bg-canvas',
            open &&
              variant === 'field' &&
              'border-brand-300 bg-white ring-4 ring-brand-500/10',
            className,
          )}
        >
          {LeadingIcon ? (
            <LeadingIcon aria-hidden className="size-4 shrink-0 text-slate-600" />
          ) : null}
          {variant === 'chip' && leadingLabel ? (
            <>
              <span aria-hidden className="shrink-0 text-xs font-medium text-slate-500">
                {leadingLabel}
              </span>
              <span aria-hidden className="h-4 w-px shrink-0 bg-slate-300/70" />
            </>
          ) : null}
          <span
            className={cn(
              'min-w-0 flex-1 truncate',
              showsPlaceholder && variant === 'field' && 'font-normal text-slate-400',
            )}
          >
            {triggerLabel}
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-transform duration-200',
              variant === 'field' ? 'right-3.5' : 'right-3',
              open && 'rotate-180 text-brand-500',
            )}
          />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            listRef.current?.focus()
          }}
          className={cn(
            'z-50 min-w-[var(--radix-popover-trigger-width)] max-w-[min(26rem,calc(100vw-1.5rem))] overflow-hidden rounded-3xl bg-white p-1.5 shadow-[0_24px_48px_-16px_rgba(20,27,58,0.28)] ring-1 ring-slate-200/60 outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          )}
        >
          <div
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={
              activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
            }
            onKeyDown={onListKeyDown}
            className="max-h-72 overflow-y-auto overscroll-contain outline-none"
          >
            {options.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                No options
              </p>
            ) : (
              options.map((option, index) => {
                const isSelected = option.value === value
                const isActive = index === activeIndex
                return (
                  <div
                    key={`${option.value}-${index}`}
                    id={`${listId}-${index}`}
                    role="option"
                    data-index={index}
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    onMouseMove={() => {
                      if (!option.disabled && activeIndex !== index) {
                        setActiveIndex(index)
                      }
                    }}
                    onClick={() => choose(index)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2 text-sm transition-colors',
                      isActive && !option.disabled && 'bg-canvas',
                      isSelected
                        ? 'font-semibold text-brand-600'
                        : 'font-medium text-ink',
                      option.value === '' && !isSelected && 'text-slate-500',
                      option.disabled && 'cursor-not-allowed opacity-45',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.description ? (
                        <span className="block truncate text-xs font-normal text-slate-500">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    <Check
                      aria-hidden
                      className={cn(
                        'size-4 shrink-0 text-brand-500',
                        isSelected ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </div>
                )
              })
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
