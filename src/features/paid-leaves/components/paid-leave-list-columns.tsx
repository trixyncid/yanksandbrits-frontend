import type { ColumnDef } from '@tanstack/react-table'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import type {
  PaidLeaveListItem,
  PaidLeaveStatus,
} from '../types/paid-leave'
import { PaidLeaveActionsCell } from './paid-leave-actions-cell'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDuration(row: PaidLeaveListItem) {
  const dayLabel = row.totalDays === 1 ? 'day' : 'days'

  if (row.startDate === row.endDate) {
    return `${formatDate(row.startDate)} (${row.totalDays} ${dayLabel})`
  }

  return `${formatDate(row.startDate)} - ${formatDate(row.endDate)} (${row.totalDays} ${dayLabel})`
}

function statusTone(status: PaidLeaveStatus) {
  if (status === 'approved') {
    return 'success' as const
  }

  if (status === 'pending') {
    return 'info' as const
  }

  return 'danger' as const
}

function statusLabel(status: PaidLeaveStatus) {
  if (status === 'approved') {
    return 'Approved'
  }

  if (status === 'pending') {
    return 'Pending'
  }

  return 'Void'
}

export const paidLeaveListColumns: ColumnDef<PaidLeaveListItem>[] = [
  {
    id: 'staffDetail',
    accessorFn: (row) => `${row.staffPin} ${row.staffName} ${row.staffEmail}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Staff Detail" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {row.original.staffPin} | {row.original.staffName}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {row.original.staffEmail}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'branch',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.branch}
      </p>
    ),
  },
  {
    id: 'duration',
    accessorFn: (row) => `${row.startDate} ${row.endDate} ${row.totalDays}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDuration(row.original)}
      </p>
    ),
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" align="center" />
    ),
    cell: ({ row }) => (
      <p className="mx-auto max-w-52 text-center text-xs text-slate-500">
        {row.original.notes || '-'}
      </p>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableBadge tone={statusTone(row.original.status)}>
          {statusLabel(row.original.status)}
        </DataTableBadge>
      </div>
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
    id: 'actions',
    enableSorting: false,
    size: 148,
    meta: { sticky: 'right' },
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        Action
      </span>
    ),
    cell: ({ row }) => <PaidLeaveActionsCell leave={row.original} />,
  },
]
