import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

import { Input } from '../ui/input'

type DataTableToolbarProps = {
  title?: string
  description?: string
  totalCount: number
  totalLabel?: string
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  actions?: ReactNode
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
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-5 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {title ? (
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
          <p className="mt-2 text-xs font-medium text-slate-400">
            Now showing:{' '}
            <span className="font-semibold text-slate-700">
              {totalCount} {totalLabel}
            </span>
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 pl-10"
              aria-label="Search table"
            />
          </div>
          {actions}
        </div>
      </div>
    </div>
  )
}
