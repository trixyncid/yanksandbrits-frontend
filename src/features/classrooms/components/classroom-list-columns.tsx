import type { ColumnDef } from '@tanstack/react-table'
import { DoorOpen } from 'lucide-react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { cn } from '../../../shared/lib/cn'
import type { ClassroomListItem } from '../types/classroom'
import { ClassroomActionsCell } from './classroom-actions-cell'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export const classroomListColumns: ColumnDef<ClassroomListItem>[] = [
  {
    id: 'classroom',
    accessorFn: (row) => `${row.className} ${row.code}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Classroom" />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-[14rem] items-center gap-2.5 py-0.5">
        <div
          className={cn(
            'inline-flex size-10 shrink-0 items-center justify-center rounded-2xl',
            row.original.isActive
              ? 'bg-brand-500 text-white'
              : 'bg-canvas text-slate-400',
          )}
        >
          <DoorOpen className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {row.original.className}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
            {row.original.code}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'branch',
    accessorFn: (row) => row.branchName ?? '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.branchName ? (
          <span className="inline-flex rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink">
            {row.original.branchName}
          </span>
        ) : (
          <span className="text-xs text-slate-400">No branch</span>
        )}
      </div>
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
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Added"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDateTime(row.original.createdAt)}
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
    cell: ({ row }) => <ClassroomActionsCell classroom={row.original} />,
  },
]
