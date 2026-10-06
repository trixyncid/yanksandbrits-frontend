import type { ColumnDef } from '@tanstack/react-table'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import type { StudentListItem } from '../types/student'
import { StudentActionsCell } from './student-actions-cell'

function formatEnrollmentDate(value: string) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export const studentListColumns: ColumnDef<StudentListItem>[] = [
  {
    id: 'studentDetail',
    accessorFn: (row) => `${row.fullName} ${row.pin} ${row.email} ${row.mobilePhone}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student's Detail" />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-[14rem] items-center gap-2.5 py-0.5">
        <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#253CA1] text-[11px] font-bold tracking-wide text-white shadow-sm shadow-[#253CA1]/20">
          {getInitials(row.original.fullName)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">
              {row.original.fullName}
            </p>
            {row.original.pin ? (
              <span className="rounded-full bg-[#E8EEFF] px-2 py-0.5 text-[11px] font-semibold text-[#253CA1]">
                {row.original.pin}
              </span>
            ) : null}
            <DataTableBadge
              tone={row.original.gender === 'M' ? 'info' : 'primary'}
            >
              {row.original.gender === 'M' ? 'Male' : 'Female'}
            </DataTableBadge>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {row.original.email || '—'}
          </p>
          <p className="truncate text-xs text-slate-500">
            {row.original.mobilePhone || '—'}
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
        <DataTableBadge
          tone={row.original.status === 'active' ? 'success' : 'danger'}
        >
          {row.original.status === 'active' ? 'Active' : 'Inactive'}
        </DataTableBadge>
      </div>
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
        {row.original.counsellor || '—'}
      </p>
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
    accessorKey: 'branch',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.branch || '—'}
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
    cell: ({ row }) => <StudentActionsCell student={row.original} />,
  },
]
