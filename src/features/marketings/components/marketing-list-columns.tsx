import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import {
  ActionColumnHeader,
  ActiveStatusPill,
  LeaveBalancePill,
  PersonIdentityCell,
  SoftPill,
} from '../../users/components/people-ui'
import type { MarketingListItem, MarketingRole } from '../types/marketing'
import { MarketingActionsCell } from './marketing-actions-cell'

function roleTone(code: string) {
  if (code === 'branch-manager' || code === 'manager') {
    return 'ink' as const
  }
  if (code === 'education-counsellor' || code === 'marketing') {
    return 'brand' as const
  }
  return 'muted' as const
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
      <DataTableColumnHeader column={column} title="Counsellor" />
    ),
    cell: ({ row }) => (
      <PersonIdentityCell
        name={row.original.fullName}
        seed={row.original.id}
        pin={row.original.pin}
        muted={!row.original.isActive}
        lines={[
          row.original.email,
          [
            row.original.phone,
            row.original.gender === 'male' ? 'Male' : 'Female',
          ]
            .filter(Boolean)
            .join(' · '),
        ]}
      />
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
              <SoftPill
                key={role.code || role.name}
                tone={roleTone(role.code)}
                dot={false}
              >
                {role.name}
              </SoftPill>
            ))
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>
      </div>
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
    id: 'salary',
    accessorFn: (row) => (row.hasSalary ? 1 : 0),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Base salary" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.hasSalary ? (
          <SoftPill tone="brand">Set</SoftPill>
        ) : (
          <SoftPill tone="amber">Not set yet</SoftPill>
        )}
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
        <ActiveStatusPill active={row.original.isActive} />
      </div>
    ),
  },
  {
    accessorKey: 'paidLeaveLeft',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paid leave" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <LeaveBalancePill left={row.original.paidLeaveLeft} />
      </div>
    ),
  },
  {
    id: 'actions',
    enableSorting: false,
    size: 148,
    meta: { sticky: 'right' },
    header: () => <ActionColumnHeader />,
    cell: ({ row }) => <MarketingActionsCell marketing={row.original} />,
  },
]
