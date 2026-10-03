import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/cn'
import { Button } from '../ui/button'

type ClearListFiltersButtonProps = {
  visible: boolean
  onClear: () => void
  label?: string
  className?: string
}

/** Shown beside list toolbar filters when any page-specific filter is active. */
export function ClearListFiltersButton({
  visible,
  onClear,
  label = 'Clear filters',
  className,
}: ClearListFiltersButtonProps) {
  if (!visible) {
    return null
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClear}
      className={cn(
        'h-9 shrink-0 border border-white/80 bg-white/70 px-3 text-slate-600 shadow-sm backdrop-blur-md hover:bg-white hover:text-slate-900',
        className,
      )}
      aria-label={label}
    >
      <X className="size-3.5" />
      {label}
    </Button>
  )
}

type ListToolbarFiltersProps = {
  children: ReactNode
}

/** Groups list filter controls so they wrap together, apart from search. */
export function ListToolbarFilters({ children }: ListToolbarFiltersProps) {
  return (
    <div
      role="group"
      aria-label="Filters"
      className="flex min-w-0 flex-wrap items-center gap-2"
    >
      {children}
    </div>
  )
}
