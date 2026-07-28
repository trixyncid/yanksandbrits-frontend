import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Trash2 } from 'lucide-react'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { notify } from '../../../shared/lib/notify'
import type { StaffListItem, StaffPosition } from '../types/staff'

function formatDateTime(value: string | null) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function positionTone(position: StaffPosition) {
  if (position === 'superuser') {
    return 'primary' as const
  }

  if (position === 'manager') {
    return 'info' as const
  }

  if (position === 'marketing') {
    return 'warning' as const
  }

  if (position === 'tutor') {
    return 'danger' as const
  }

  return 'neutral' as const
}

function positionLabel(position: StaffPosition) {
  if (position === 'superuser') {
    return 'Superuser'
  }

  if (position === 'manager') {
    return 'Manager'
  }

  if (position === 'marketing') {
    return 'Marketing'
  }

  if (position === 'tutor') {
    return 'Tutor'
  }

  return 'Staff'
}

export const staffListColumns: ColumnDef<StaffListItem>[] = [
  {
    id: 'accountDetail',
    accessorFn: (row) => `${row.pin} ${row.fullName} ${row.email}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account's Detail" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {row.original.pin} | {row.original.fullName}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{row.original.email}</p>
        <p className="text-xs text-slate-500">
          {row.original.gender === 'male' ? 'Male' : 'Female'}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'position',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Staff Position"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableBadge tone={positionTone(row.original.position)}>
          {positionLabel(row.original.position)}
        </DataTableBadge>
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
        <DataTableBadge tone={row.original.isActive ? 'success' : 'danger'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </DataTableBadge>
      </div>
    ),
  },
  {
    accessorKey: 'paidLeaveLeft',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Paid Leave Total"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.paidLeaveLeft}x left
      </p>
    ),
  },
  {
    accessorKey: 'lastLogin',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last Login"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDateTime(row.original.lastLogin)}
      </p>
    ),
  },
  {
    accessorKey: 'dateJoined',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Date Joined"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDateTime(row.original.dateJoined)}
      </p>
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
    id: 'actions',
    enableSorting: false,
    size: 120,
    meta: { sticky: 'right' },
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        Action
      </span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label={`Edit staff ${row.original.fullName}`}
          onClick={() =>
            notify('info', {
              title: 'Edit staff placeholder',
              description: `${row.original.fullName} detail page will be added later.`,
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
        >
          <Eye className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Delete staff ${row.original.fullName}`}
          onClick={() =>
            notify('warning', {
              title: 'Delete staff placeholder',
              description: `${row.original.fullName} delete confirmation will be added later.`,
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    ),
  },
]
