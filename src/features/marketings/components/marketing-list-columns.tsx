import type { ColumnDef } from '@tanstack/react-table'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import type { MarketingListItem, MarketingRole } from '../types/marketing'
import { MarketingActionsCell } from './marketing-actions-cell'

function roleTone(code: string) {
  if (code === 'branch-manager' || code === 'manager') {
    return 'info' as const
  }
  if (code === 'education-counsellor' || code === 'marketing') {
    return 'primary' as const
  }
  return 'neutral' as const
}

function roleLabels(roles: MarketingRole[]) {
  if (!roles.length) {
    return '—'
  }
  return roles.map((role) => role.name).join(', ')
}

export const marketingListColumns: ColumnDef<MarketingListItem>[] = [
  {
    id: 'marketingDetail',
    accessorFn: (row) => `${row.pin} ${row.fullName} ${row.email}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Counsellor Detail" />
    ),
    cell: ({ row }) => (
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">
            {row.original.pin} - {row.original.fullName}
          </p>
          <DataTableBadge
            tone={row.original.gender === 'male' ? 'info' : 'primary'}
          >
            {row.original.gender === 'male' ? 'Male' : 'Female'}
          </DataTableBadge>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{row.original.email}</p>
        <p className="text-xs text-slate-500">{row.original.phone || '-'}</p>
      </div>
    ),
  },
  {
    id: 'role',
    accessorFn: (row) => roleLabels(row.roles),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" align="center" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
          {row.original.roles.length ? (
            row.original.roles.map((role) => (
              <DataTableBadge
                key={role.code || role.name}
                tone={roleTone(role.code)}
              >
                {role.name}
              </DataTableBadge>
            ))
          ) : (
            <p className="text-xs font-medium text-slate-600">—</p>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableBadge tone={row.original.isActive ? 'success' : 'danger'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </DataTableBadge>
      </div>
    ),
  },
  {
    accessorKey: 'paidLeaveLeft',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Paid Leave"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.paidLeaveLeft}x left
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
    size: 148,
    meta: { sticky: 'right' },
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        Action
      </span>
    ),
    cell: ({ row }) => <MarketingActionsCell marketing={row.original} />,
  },
]
