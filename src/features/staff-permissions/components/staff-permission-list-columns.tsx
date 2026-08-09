import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import type { StaffPermissionListItem } from '../types/staff-permission'
import { StaffPermissionActionsCell } from './staff-permission-actions-cell'

export const staffPermissionListColumns: ColumnDef<StaffPermissionListItem>[] =
  [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Role"
          align="center"
        />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">
            {row.original.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {row.original.code ? `${row.original.code} · ` : ''}
            {row.original.permissionCount} permissions ·{' '}
            {row.original.memberCount} members
            {row.original.isSystem ? ' · system' : ''}
          </p>
        </div>
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
        <StaffPermissionActionsCell group={row.original} />
      ),
    },
  ]
