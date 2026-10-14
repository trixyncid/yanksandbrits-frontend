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
import type { TutorListItem } from '../types/tutor'
import { TutorActionsCell } from './tutor-actions-cell'

export const tutorListColumns: ColumnDef<TutorListItem>[] = [
  {
    id: 'tutorDetail',
    accessorFn: (row) => `${row.pin} ${row.fullName} ${row.email}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tutor" />
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
    id: 'workingHours',
    accessorFn: (row) => (row.hasWorkingSchedule ? 1 : 0),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Working hours" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.employmentType === 'FL' ? (
          <SoftPill tone="muted">Freelance</SoftPill>
        ) : row.original.hasWorkingSchedule ? (
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
        {row.original.employmentType === 'FL' ? (
          <span className="text-xs text-slate-400">No leave</span>
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
    size: 148,
    meta: { sticky: 'right' },
    header: () => <ActionColumnHeader />,
    cell: ({ row }) => <TutorActionsCell tutor={row.original} />,
  },
]
