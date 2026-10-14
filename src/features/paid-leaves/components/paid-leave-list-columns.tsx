import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import {
  ActionColumnHeader,
  PersonIdentityCell,
  SoftPill,
} from '../../users/components/people-ui'
import type {
  PaidLeaveListItem,
  PaidLeaveStatus,
} from '../types/paid-leave'
import { LeaveDateTile } from './leave-date-tile'
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

function statusTone(status: PaidLeaveStatus) {
  if (status === 'approved') return 'emerald' as const
  if (status === 'pending') return 'amber' as const
  return 'muted' as const
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
      <DataTableColumnHeader column={column} title="Person" />
    ),
    cell: ({ row }) => (
      <PersonIdentityCell
        name={row.original.staffName}
        seed={row.original.userId}
        pin={row.original.staffPin}
        lines={[row.original.staffEmail]}
      />
    ),
  },
  {
    id: 'duration',
    accessorFn: (row) => `${row.startDate} ${row.endDate} ${row.totalDays}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="When" />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-[12rem] items-center gap-2.5">
        <LeaveDateTile value={row.original.startDate} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">
            {row.original.totalDays}{' '}
            {row.original.totalDays === 1 ? 'day' : 'days'}
          </p>
          <p className="text-xs text-slate-500">
            {row.original.startDate === row.original.endDate
              ? formatDate(row.original.startDate)
              : `${formatDate(row.original.startDate)} – ${formatDate(row.original.endDate)}`}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <SoftPill tone={statusTone(row.original.status)}>
          {statusLabel(row.original.status)}
        </SoftPill>
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
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notes" />
    ),
    cell: ({ row }) => (
      <p
        className="line-clamp-2 max-w-60 text-xs text-slate-500"
        title={row.original.notes || undefined}
      >
        {row.original.notes || '—'}
      </p>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Recorded" align="center" />
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
    header: () => <ActionColumnHeader />,
    cell: ({ row }) => <PaidLeaveActionsCell leave={row.original} />,
  },
]
