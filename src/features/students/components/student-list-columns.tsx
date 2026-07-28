import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Trash2 } from 'lucide-react'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { notify } from '../../../shared/lib/notify'
import type { StudentListItem } from '../types/student'

function formatEnrollmentDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export const studentListColumns: ColumnDef<StudentListItem>[] = [
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student Detail" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {row.original.pin} | {row.original.fullName}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{row.original.email}</p>
        <p className="text-xs text-slate-500">{row.original.mobilePhone}</p>
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
        <DataTableBadge tone={row.original.gender === 'M' ? 'info' : 'primary'}>
          {row.original.gender === 'M' ? 'Male' : 'Female'}
        </DataTableBadge>
      </div>
    ),
  },
  {
    accessorKey: 'enrollmentDate',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Enrollment Date"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatEnrollmentDate(row.original.enrollmentDate)}
      </p>
    ),
  },
  {
    accessorKey: 'counsellor',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Education Counsellor"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.counsellor}
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
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableBadge
          tone={row.original.status === 'active' ? 'success' : 'danger'}
        >
          {row.original.status === 'active' ? 'Active' : 'Inactive'}
        </DataTableBadge>
      </div>
    ),
  },
  {
    id: 'actions',
    enableSorting: false,
    size: 120,
    meta: {
      sticky: 'right',
    },
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        Action
      </span>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label={`View ${row.original.fullName}`}
          onClick={() =>
            notify('info', {
              title: 'View student placeholder',
              description: `${row.original.pin} detail page will be added later.`,
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
        >
          <Eye className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Delete ${row.original.fullName}`}
          onClick={() =>
            notify('warning', {
              title: 'Delete student placeholder',
              description: `${row.original.pin} delete confirmation will be added later.`,
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
