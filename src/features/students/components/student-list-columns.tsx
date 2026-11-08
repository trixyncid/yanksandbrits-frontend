import type { ColumnDef } from '@tanstack/react-table'
import { Smartphone } from 'lucide-react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { cn } from '../../../shared/lib/cn'
import { getStudentInitials } from '../lib/student-display'
import type { StudentListItem } from '../types/student'
import { StudentActionsCell } from './student-actions-cell'
import { StudentStatusPill } from './student-status-pill'

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

export const studentListColumns: ColumnDef<StudentListItem>[] = [
  {
    id: 'studentDetail',
    accessorFn: (row) =>
      `${row.fullName} ${row.pin} ${row.email} ${row.mobilePhone}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-[15rem] items-center gap-2.5 py-0.5">
        <div
          className={cn(
            'relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold tracking-wide',
            row.original.status === 'active'
              ? 'bg-brand-500 text-white'
              : 'bg-canvas text-slate-500',
          )}
        >
          {getStudentInitials(row.original.fullName)}
          {row.original.hasAccount ? (
            <span
              title="Has a student app account"
              className="absolute -right-0.5 -bottom-0.5 inline-flex size-4 items-center justify-center rounded-full bg-white text-brand-600 ring-2 ring-white"
            >
              <Smartphone className="size-2.5" />
            </span>
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-ink">
              {row.original.fullName}
            </p>
            {row.original.pin ? (
              <span className="rounded-full bg-canvas px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                {row.original.pin}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {row.original.gender === 'M' ? 'Male' : 'Female'}
            {' · '}
            {row.original.email || 'No email'}
          </p>
          <p className="truncate text-xs text-slate-400">
            {row.original.mobilePhone || 'No phone'}
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
        <StudentStatusPill status={row.original.status} />
      </div>
    ),
  },
  {
    accessorKey: 'age',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600 tabular-nums">
        {row.original.age ?? '—'}
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
        {row.original.counsellor || '—'}
      </p>
    ),
  },
  {
    accessorKey: 'enrollmentDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Enrolled" align="center" />
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
      <div className="text-center">
        {row.original.branch ? (
          <span className="inline-flex rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink">
            {row.original.branch}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </div>
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
