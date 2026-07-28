import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Trash2 } from 'lucide-react'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { notify } from '../../../shared/lib/notify'
import type {
  StudentResponseListItem,
  StudentResponseStatus,
} from '../types/student-response'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function statusTone(status: StudentResponseStatus) {
  if (status === 'approved') {
    return 'success' as const
  }

  if (status === 'pending') {
    return 'info' as const
  }

  return 'danger' as const
}

function statusLabel(status: StudentResponseStatus) {
  if (status === 'approved') {
    return 'Approved'
  }

  if (status === 'pending') {
    return 'Pending'
  }

  return 'Void'
}

export const studentResponseListColumns: ColumnDef<StudentResponseListItem>[] =
  [
    {
      id: 'student',
      accessorFn: (row) => `${row.studentPin} ${row.studentName}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {row.original.studentPin} | {row.original.studentName}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {row.original.studentEmail}
          </p>
          <p className="text-xs text-slate-500">{row.original.studentPhone}</p>
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" align="center" />
      ),
      cell: ({ row }) => (
        <p className="text-center text-xs font-medium text-slate-600">
          {row.original.title}
        </p>
      ),
    },
    {
      id: 'tutor',
      accessorFn: (row) => `${row.tutorPin} ${row.tutorName}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tutor" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {row.original.tutorPin} - {row.original.tutorName}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {row.original.tutorEmail}
          </p>
          <p className="text-xs text-slate-500">
            {row.original.tutorPhone || '-'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Description"
          align="center"
        />
      ),
      cell: ({ row }) => (
        <p className="mx-auto max-w-56 text-center text-xs text-slate-500">
          {row.original.description || '-'}
        </p>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Date Created"
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
            aria-label={`View response ${row.original.title}`}
            onClick={() =>
              notify('info', {
                title: 'View response placeholder',
                description: `${row.original.title} detail page will be added later.`,
              })
            }
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
          >
            <Eye className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Delete response ${row.original.title}`}
            onClick={() =>
              notify('warning', {
                title: 'Delete response placeholder',
                description: `${row.original.title} delete confirmation will be added later.`,
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
