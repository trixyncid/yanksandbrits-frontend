import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { cn } from '../../../shared/lib/cn'
import { programAudienceLabel, type ProgramListItem } from '../types/program'
import { ProgramActionsCell } from './program-actions-cell'

function formatDateTime(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function codeMonogram(code: string) {
  const letters = code.replace(/[^A-Za-z0-9]/g, '')
  return (letters.slice(0, 3) || '?').toUpperCase()
}

export const programListColumns: ColumnDef<ProgramListItem>[] = [
  {
    id: 'program',
    accessorFn: (row) => `${row.title} ${row.code}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Program" />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-[16rem] items-center gap-2.5 py-0.5">
        {/* The swatch is the program's own schedule colors. */}
        <div
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold tracking-wide shadow-sm ring-1 ring-black/5"
          style={{
            backgroundColor: row.original.backgroundColor,
            color: row.original.textColor,
          }}
        >
          {codeMonogram(row.original.code)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {row.original.title}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
            {row.original.code}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'subject',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subject" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.subject ? (
          <span className="inline-flex rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink">
            {row.original.subject}
          </span>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'audience',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Intended for" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
            row.original.audience === 'tutor'
              ? 'bg-amber-50 text-amber-800'
              : row.original.audience === 'both'
                ? 'bg-violet-50 text-violet-700'
                : 'bg-brand-50 text-brand-700',
          )}
        >
          {programAudienceLabel(row.original.audience)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <p
        className="line-clamp-2 max-w-80 text-xs text-slate-500"
        title={row.original.description || undefined}
      >
        {row.original.description || '-'}
      </p>
    ),
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            row.original.isActive
              ? 'bg-brand-50 text-brand-700'
              : 'bg-canvas text-slate-500',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'size-1.5 rounded-full',
              row.original.isActive ? 'bg-brand-500' : 'bg-slate-400',
            )}
          />
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last Updated"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDateTime(row.original.updatedAt)}
      </p>
    ),
  },
  {
    id: 'actions',
    enableSorting: false,
    size: 120,
    meta: { sticky: 'right' },
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        Action
      </span>
    ),
    cell: ({ row }) => <ProgramActionsCell program={row.original} />,
  },
]
