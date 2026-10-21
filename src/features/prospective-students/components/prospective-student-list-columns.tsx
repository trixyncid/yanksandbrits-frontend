import type { ColumnDef } from '@tanstack/react-table'

import { Mail, Phone, Users } from 'lucide-react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { courseLabel } from '../api/prospective-students-api'
import { getInitials } from '../lib/lead-status'
import type { ProspectiveStudentListItem } from '../types/prospective-student'
import { LeadStatusPill } from './lead-status-pill'
import { ProspectiveStudentActionsCell } from './prospective-student-actions-cell'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export const prospectiveStudentListColumns: ColumnDef<ProspectiveStudentListItem>[] = [
  {
    id: 'studentDetail',
    accessorFn: (row) => `${row.fullName} ${row.email} ${row.phone}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student's Detail" />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-[15rem] items-center gap-3 py-0.5">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold tracking-wide text-brand-700">
          {getInitials(row.original.fullName)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-slate-900">
              {row.original.fullName}
            </p>
            {row.original.gender ? (
              <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                {row.original.gender === 'male' ? 'Male' : 'Female'}
              </span>
            ) : null}
            {row.original.responseSize > 1 ? (
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700"
                title="Came in with other students in one response; counts once for the counsellor."
              >
                <Users aria-hidden className="size-3" />
                Response of {row.original.responseSize}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
            <Phone aria-hidden className="size-3 shrink-0 text-slate-400" />
            {row.original.phone || '—'}
          </p>
          {row.original.email ? (
            <p className="flex items-center gap-1 truncate text-xs text-slate-500">
              <Mail aria-hidden className="size-3 shrink-0 text-slate-400" />
              <span className="truncate">{row.original.email}</span>
            </p>
          ) : null}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'course',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prediction Test" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.course ? (
          <span className="inline-flex rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink">
            {courseLabel(row.original.course)}
          </span>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        )}
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
        <LeadStatusPill status={row.original.status} />
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
        title="Created"
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
    cell: ({ row }) => <ProspectiveStudentActionsCell student={row.original} />,
  },
]
