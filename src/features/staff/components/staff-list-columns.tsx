import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import {
  ActionColumnHeader,
  ActiveStatusPill,
  LeaveBalancePill,
  PersonIdentityCell,
  SoftPill,
} from '../../users/components/people-ui'
import {
  formatPeopleDate,
  formatRelativeLogin,
} from '../../users/lib/people-format'
import type { StaffListItem } from '../types/staff'
import { StaffActionsCell } from './staff-actions-cell'

function roleTone(code: string) {
  if (code === 'systemadmin') return 'ink' as const
  if (code === 'student') return 'emerald' as const
  return 'brand' as const
}

/** Real role names; falls back to Superuser / Student / No role. */
function roleBadges(row: StaffListItem) {
  if (row.roles.length > 0) {
    return row.roles.map((role) => ({
      key: role.code || role.name,
      label: role.name,
      tone: roleTone(role.code),
    }))
  }
  if (row.isSuperuser) return [{ key: 'superuser', label: 'Superuser', tone: 'ink' as const }]
  if (row.isStudent) return [{ key: 'student', label: 'Student', tone: 'emerald' as const }]
  return [{ key: 'none', label: 'No role', tone: 'muted' as const }]
}

function genderLabel(gender: StaffListItem['gender']) {
  if (gender === 'male') return 'Male'
  if (gender === 'female') return 'Female'
  return ''
}

export const staffListColumns: ColumnDef<StaffListItem>[] = [
  {
    id: 'accountDetail',
    accessorFn: (row) => `${row.pin ?? ''} ${row.fullName} ${row.email}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Person" />
    ),
    cell: ({ row }) => (
      <PersonIdentityCell
        name={row.original.fullName}
        seed={row.original.id}
        pin={row.original.pin}
        muted={!row.original.isActive}
        lines={[
          row.original.email,
          !row.original.isStudent ? genderLabel(row.original.gender) : null,
        ]}
      />
    ),
  },
  {
    id: 'role',
    accessorFn: (row) => roleBadges(row).map((badge) => badge.label).join(', '),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" align="center" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-wrap justify-center gap-1">
        {roleBadges(row.original).map((badge) => (
          <SoftPill key={badge.key} tone={badge.tone} dot={false}>
            {badge.label}
          </SoftPill>
        ))}
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
        {row.original.isStudent ? (
          <span className="text-xs text-slate-400">—</span>
        ) : (
          <LeaveBalancePill left={row.original.paidLeaveLeft} />
        )}
      </div>
    ),
  },
  {
    accessorKey: 'lastLogin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last sign-in" align="center" />
    ),
    cell: ({ row }) => (
      <p
        className="text-center text-xs font-medium text-slate-600"
        title={formatPeopleDate(row.original.lastLogin, true)}
      >
        {formatRelativeLogin(row.original.lastLogin)}
      </p>
    ),
  },
  {
    accessorKey: 'dateJoined',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatPeopleDate(row.original.dateJoined)}
      </p>
    ),
  },
  {
    id: 'actions',
    enableSorting: false,
    size: 120,
    meta: { sticky: 'right' },
    header: () => <ActionColumnHeader />,
    cell: ({ row }) => <StaffActionsCell staff={row.original} />,
  },
]
