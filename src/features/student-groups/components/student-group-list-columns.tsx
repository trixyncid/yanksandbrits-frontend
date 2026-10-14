import type { ColumnDef } from '@tanstack/react-table'
import { Users } from 'lucide-react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { cn } from '../../../shared/lib/cn'
import { initials } from '../lib/initials'
import type { StudentGroupListItem } from '../types/student-group'
import { StudentGroupActionsCell } from './student-group-actions-cell'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

const VISIBLE_MEMBERS = 3

export const studentGroupListColumns: ColumnDef<StudentGroupListItem>[] = [
  {
    id: 'group',
    accessorKey: 'groupName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Group" />
    ),
    cell: ({ row }) => {
      const count = row.original.members.length
      return (
        <div className="flex min-w-[14rem] items-center gap-2.5 py-0.5">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Users className="size-4" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {row.original.groupName}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {count} {count === 1 ? 'student' : 'students'}
              {row.original.branch ? ` · ${row.original.branch}` : ''}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    id: 'members',
    accessorFn: (row) =>
      row.members.map((member) => `${member.fullName} ${member.pin}`).join(' '),
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Members" />
    ),
    cell: ({ row }) => {
      const members = row.original.members
      if (members.length === 0) {
        return <span className="text-xs text-slate-400">No members</span>
      }
      const shown = members.slice(0, VISIBLE_MEMBERS)
      const hidden = members.length - shown.length
      return (
        <div
          className="flex min-w-[15rem] items-center gap-2.5"
          title={members
            .map((member) => `${member.fullName} (${member.pin || member.id})`)
            .join('\n')}
        >
          <div className="flex shrink-0 -space-x-2">
            {shown.map((member) => (
              <span
                key={member.id}
                aria-hidden
                className="inline-flex size-7 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 ring-2 ring-white"
              >
                {initials(member.fullName)}
              </span>
            ))}
            {hidden > 0 ? (
              <span
                aria-hidden
                className="inline-flex size-7 items-center justify-center rounded-full bg-canvas text-[10px] font-bold text-slate-600 ring-2 ring-white"
              >
                +{hidden}
              </span>
            ) : null}
          </div>
          <ul className="min-w-0 text-xs leading-snug text-slate-600">
            {shown.map((member) => (
              <li key={member.id} className="truncate">
                {member.fullName}{' '}
                <span className="font-mono text-slate-400">
                  {member.pin || member.id}
                </span>
              </li>
            ))}
            {hidden > 0 ? (
              <li className="font-medium text-slate-400">
                and {hidden} more
              </li>
            ) : null}
          </ul>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" align="center" />
    ),
    cell: ({ row }) => {
      const active = row.original.status === 'active'
      return (
        <div className="text-center">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
              active ? 'bg-brand-50 text-brand-700' : 'bg-canvas text-slate-500',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'size-1.5 rounded-full',
                active ? 'bg-brand-500' : 'bg-slate-400',
              )}
            />
            {active ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
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
          <span className="text-xs text-slate-400">-</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Created By"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.createdBy || '-'}
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
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last Updated"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDateTime(row.original.updatedAt)}
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
    cell: ({ row }) => <StudentGroupActionsCell group={row.original} />,
  },
]
