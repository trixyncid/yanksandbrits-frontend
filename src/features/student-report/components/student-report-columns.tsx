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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (
    (parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1]![0] : '')
  ).toUpperCase() || '?'
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
    id: 'student',
    accessorFn: (row) => `${row.fullName} ${row.pin}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-[14rem] items-center gap-2.5 py-0.5">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
          {initials(row.original.fullName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {row.original.fullName}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
            {row.original.pin}
          </p>
        </div>
      </div>
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
      <ul className="flex flex-wrap justify-center gap-1">
        {row.original.programs.length > 0 ? (
          row.original.programs.map((program) => (
            <li
              key={program}
              className="rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink"
            >
              {program}
            </li>
          ))
        ) : (
          <li className="text-xs text-slate-400">-</li>
        )}
      </ul>
    ),
  },
]
