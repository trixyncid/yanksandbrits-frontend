import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import type { AppointmentReportRow } from '../types/appointment-report'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export const appointmentReportColumns: ColumnDef<AppointmentReportRow>[] = [
  {
    id: 'no',
    enableSorting: false,
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        No.
      </span>
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.index + 1}
      </p>
    ),
  },
  {
    accessorKey: 'program',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Program" />
    ),
    cell: ({ row }) => (
      <p className="text-sm font-medium text-slate-800">{row.original.program}</p>
    ),
  },
  {
    accessorKey: 'tutorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tutor" />
    ),
    cell: ({ row }) => (
      <p className="text-sm font-medium text-slate-800">
        {row.original.tutorName}
      </p>
    ),
  },
  {
    accessorKey: 'studentName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => (
      <p className="text-sm font-medium text-slate-800">
        {row.original.studentName}
      </p>
    ),
  },
  {
    accessorKey: 'appointmentTime',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Appt. Time"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDateTime(row.original.appointmentTime)}
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
]
