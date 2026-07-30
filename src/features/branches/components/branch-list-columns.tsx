import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import type { BranchListItem } from '../types/branch'
import { BranchActionsCell } from './branch-actions-cell'

function formatDateTime(value: string) {
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
      <DataTableColumnHeader column={column} title="Branch Name" />
    ),
    cell: ({ row }) => (
      <div className="ps-1">
        <p className="text-sm font-semibold text-slate-900">
          {row.original.name}
        </p>
        {row.original.brandName ? (
          <p className="mt-0.5 text-[11px] text-slate-400">
            {row.original.brandName}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Phone Number"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.phone || '-'}
      </p>
    ),
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" align="center" />
    ),
    cell: ({ row }) => (
      <p className="mx-auto max-w-64 text-center text-xs text-slate-500">
        {row.original.address || '-'}
      </p>
    ),
  },
  {
    accessorKey: 'totalStudent',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Total Student"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-semibold text-slate-800 tabular-nums">
        {row.original.totalStudent}
      </p>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Created At"
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
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Updated At"
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
    size: 96,
    meta: { sticky: 'right' },
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        Action
      </span>
    ),
    cell: ({ row }) => <BranchActionsCell branch={row.original} />,
  },
]
