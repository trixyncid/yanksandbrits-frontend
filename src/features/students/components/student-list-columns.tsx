import type { ColumnDef } from '@tanstack/react-table'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import type { StudentListItem } from '../types/student'
import { StudentActionsCell } from './student-actions-cell'

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
    size: 148,
    meta: {
      sticky: 'right',
    },
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        Action
      </span>
    ),
    cell: ({ row }) => <StudentActionsCell student={row.original} />,
  },
]
