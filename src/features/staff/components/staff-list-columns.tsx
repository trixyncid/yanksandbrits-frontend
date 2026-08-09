import type { ColumnDef } from '@tanstack/react-table'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import type { StaffListItem, StaffPosition } from '../types/staff'
import { StaffActionsCell } from './staff-actions-cell'

function formatDateTime(value: string | null) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
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

  if (position === 'student') {
    return 'success' as const
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

  if (position === 'student') {
    return 'Student'
  }

  return 'User'
}

function accountTitle(row: StaffListItem) {
  if (row.pin) {
    return `${row.pin} | ${row.fullName}`
  }
  return row.fullName
}

function genderLabel(gender: StaffListItem['gender']) {
  if (gender === 'male') return 'Male'
  if (gender === 'female') return 'Female'
  return '—'
}

export const staffListColumns: ColumnDef<StaffListItem>[] = [
  {
    id: 'accountDetail',
    accessorFn: (row) => `${row.pin ?? ''} ${row.fullName} ${row.email}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account detail" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {accountTitle(row.original)}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{row.original.email}</p>
        {!row.original.isStudent ? (
          <p className="text-xs text-slate-500">
            {genderLabel(row.original.gender)}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: 'position',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Role"
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
        title="Paid leave"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.isStudent
          ? '—'
          : `${row.original.paidLeaveLeft}x left`}
      </p>
    ),
  },
  {
    accessorKey: 'lastLogin',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last login"
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
        title="Date joined"
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
    cell: ({ row }) => <StaffActionsCell staff={row.original} />,
  },
]
