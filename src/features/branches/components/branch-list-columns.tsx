import type { ColumnDef } from '@tanstack/react-table'
import { Building2, Phone, Star, Users } from 'lucide-react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { cn } from '../../../shared/lib/cn'
import type { BranchListItem } from '../types/branch'
import { BranchActionsCell } from './branch-actions-cell'

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

export const branchListColumns: ColumnDef<BranchListItem>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch" />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-[16rem] items-center gap-3 py-0.5">
        <span
          className={cn(
            'inline-flex size-10 shrink-0 items-center justify-center rounded-2xl',
            row.original.isMain
              ? 'bg-ink text-white'
              : 'bg-brand-50 text-brand-600',
          )}
        >
          <Building2 className="size-4" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">
              {row.original.name}
            </p>
            {row.original.isMain ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                <Star className="size-3 fill-current" />
                Main
              </span>
            ) : null}
          </div>
          <p
            className="mt-0.5 max-w-80 truncate text-xs text-slate-500"
            title={row.original.address || undefined}
          >
            {row.original.address || 'No address yet'}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.phone ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
            <Phone className="size-3 text-slate-400" />
            {row.original.phone}
          </span>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'totalStudent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Students" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums',
            row.original.totalStudent > 0
              ? 'bg-brand-50 text-brand-700'
              : 'bg-canvas text-slate-500',
          )}
        >
          <Users className="size-3" />
          {row.original.totalStudent}
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
    cell: ({ row }) => <BranchActionsCell branch={row.original} />,
  },
]
