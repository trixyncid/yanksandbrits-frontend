import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Trash2 } from 'lucide-react'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { notify } from '../../../shared/lib/notify'
import type {
  NewStudentListItem,
  NewStudentStatus,
} from '../types/new-student'

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
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label={`View new student ${row.original.fullName}`}
          onClick={() =>
            notify('info', {
              title: 'View new student placeholder',
              description: `${row.original.fullName} detail page will be added later.`,
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
        >
          <Eye className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Delete new student ${row.original.fullName}`}
          onClick={() =>
            notify('warning', {
              title: 'Delete new student placeholder',
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
