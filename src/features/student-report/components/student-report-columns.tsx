import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import type { StudentReportRow } from '../types/student-report'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export const studentReportColumns: ColumnDef<StudentReportRow>[] = [
  {
    id: 'no',
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        No.
      </span>
    ),
    enableSorting: false,
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.index + 1}
      </p>
    ),
  },
  {
    accessorKey: 'pin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PIN" />
    ),
    cell: ({ row }) => (
      <p className="text-sm font-semibold text-slate-900">{row.original.pin}</p>
    ),
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student's Name" />
    ),
    cell: ({ row }) => (
      <p className="text-sm font-medium text-slate-800">
        {row.original.fullName}
      </p>
    ),
  },
  {
    accessorKey: 'enrollmentDate',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Registration Date"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDate(row.original.enrollmentDate)}
      </p>
    ),
  },
  {
    accessorKey: 'resource',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Resource" align="center" />
    ),
    cell: ({ row }) => (
      <p className="mx-auto max-w-56 text-center text-xs text-slate-500">
        {row.original.resource}
      </p>
    ),
  },
  {
    accessorKey: 'responseNo',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Response No."
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.responseNo || '-'}
      </p>
    ),
  },
  {
    id: 'programs',
    accessorFn: (row) => row.programs.join(' '),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Program" align="center" />
    ),
    cell: ({ row }) => (
      <ul className="space-y-1 text-center text-xs text-slate-600">
        {row.original.programs.length > 0 ? (
          row.original.programs.map((program) => (
            <li key={program}>{program}</li>
          ))
        ) : (
          <li>-</li>
        )}
      </ul>
    ),
  },
]
