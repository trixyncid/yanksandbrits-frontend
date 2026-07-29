import type { ColumnDef } from '@tanstack/react-table'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import type {
  NewStudentListItem,
  NewStudentStatus,
} from '../types/new-student'
import { NewStudentActionsCell } from './new-student-actions-cell'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function statusTone(status: NewStudentStatus) {
  if (status === 'prediction_test') {
    return 'success' as const
  }

  if (status === 'consult') {
    return 'primary' as const
  }

  if (status === 'follow_up') {
    return 'info' as const
  }

  if (status === 'cancelled') {
    return 'danger' as const
  }

  return 'neutral' as const
}

function statusLabel(status: NewStudentStatus) {
  if (status === 'waiting') {
    return 'Waiting'
  }

  if (status === 'follow_up') {
    return 'Follow Up'
  }

  if (status === 'consult') {
    return 'Consult'
  }

  if (status === 'prediction_test') {
    return 'Prediction Test'
  }

  return 'Cancelled'
}

export const newStudentListColumns: ColumnDef<NewStudentListItem>[] = [
  {
    id: 'studentDetail',
    accessorFn: (row) => `${row.fullName} ${row.email} ${row.phone}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student's Detail" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {row.original.fullName}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {row.original.email || '-'}
        </p>
        <p className="text-xs text-slate-500">{row.original.phone}</p>
      </div>
    ),
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableBadge tone="info">
          {row.original.gender === 'male' ? 'Male' : 'Female'}
        </DataTableBadge>
      </div>
    ),
  },
  {
    accessorKey: 'course',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.course || '-'}
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
    accessorKey: 'educationCounsellor',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Education Counsellor"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.educationCounsellor || '-'}
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
    cell: ({ row }) => <NewStudentActionsCell student={row.original} />,
  },
]
