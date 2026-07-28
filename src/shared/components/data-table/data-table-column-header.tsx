import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import type { Column } from '@tanstack/react-table'

import { cn } from '../../lib/cn'

type DataTableColumnHeaderProps<TData, TValue> = {
  column: Column<TData, TValue>
  title: string
  className?: string
  align?: 'left' | 'center' | 'right'
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  align = 'left',
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <span
        className={cn(
          'text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase',
          align === 'center' && 'block text-center',
          align === 'right' && 'block text-right',
          className,
        )}
      >
        {title}
      </span>
    )
  }

  const sorted = column.getIsSorted()

  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase transition hover:text-slate-700',
        align === 'center' && 'w-full justify-center',
        align === 'right' && 'w-full justify-end',
        className,
      )}
    >
      <span>{title}</span>
      {sorted === 'asc' ? (
        <ArrowUp className="size-3.5 text-[#4274B9]" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="size-3.5 text-[#4274B9]" />
      ) : (
        <ArrowUpDown className="size-3.5 opacity-50" />
      )}
    </button>
  )
}
