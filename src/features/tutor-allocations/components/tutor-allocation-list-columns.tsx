import type { ColumnDef } from '@tanstack/react-table'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { programLabel } from '../lib/programs'
import type { TutorAllocationListItem } from '../types/tutor-allocation'
import { TutorAllocationActionsCell } from './tutor-allocation-actions-cell'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function studentNames(row: TutorAllocationListItem) {
  return row.members.map((member) => member.studentName).filter(Boolean)
}

export const tutorAllocationListColumns: ColumnDef<TutorAllocationListItem>[] = [
  {
    id: 'studentRecord',
    accessorFn: (row) => studentNames(row).join(' '),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student Record" />
    ),
    cell: ({ row }) => {
      const names = studentNames(row.original)
      const pins = row.original.members
        .map((member) => member.pin)
        .filter(Boolean)
      const label = names.length > 0 ? names.join(', ') : 'No students'
      const typeLabel =
        row.original.classType === 'private'
          ? 'Private'
          : `Group of ${row.original.groupSize}`

      return (
        <div className="flex min-w-[14rem] items-center gap-2.5 py-0.5">
          <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#253CA1] text-[11px] font-bold tracking-wide text-white shadow-sm shadow-[#253CA1]/20">
            {getInitials(names[0] ?? label)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-900">
                {label}
              </p>
              <DataTableBadge tone="neutral">{typeLabel}</DataTableBadge>
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {pins.length > 0 ? pins.join(', ') : '—'}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    id: 'program',
    accessorFn: (row) => programLabel(row.program),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Program" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.program ? programLabel(row.original.program) : '—'}
      </p>
    ),
  },
  {
    id: 'approval',
    accessorFn: (row) => (row.approved ? 'Approved' : 'Awaiting approval'),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Approval" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableBadge tone={row.original.approved ? 'success' : 'warning'}>
          {row.original.approved ? 'Approved' : 'Awaiting approval'}
        </DataTableBadge>
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDateTime(row.original.createdAt)}
      </p>
    ),
  },
  {
    id: 'branch',
    accessorFn: (row) => row.branchName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.branchName || '—'}
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
      <TutorAllocationActionsCell allocation={row.original} />
    ),
  },
]
