import type { ColumnDef } from '@tanstack/react-table'
import { Lock, ShieldCheck } from 'lucide-react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { cn } from '../../../shared/lib/cn'
import {
  ActionColumnHeader,
  SoftPill,
} from '../../users/components/people-ui'
import type { StaffPermissionListItem } from '../types/staff-permission'
import { StaffPermissionActionsCell } from './staff-permission-actions-cell'

export const staffPermissionListColumns: ColumnDef<StaffPermissionListItem>[] =
  [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => (
        <div className="flex min-w-[16rem] items-center gap-3 py-0.5">
          <span
            className={cn(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-2xl',
              row.original.isSystem
                ? 'bg-ink text-white'
                : 'bg-brand-50 text-brand-600',
            )}
          >
            {row.original.isSystem ? (
              <Lock className="size-4" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-ink">
                {row.original.name}
              </p>
              {row.original.isSystem ? (
                <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  Built-in
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-slate-500">
              {row.original.description || 'No description yet'}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'permissionCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Allowed actions" align="center" />
      ),
      cell: ({ row }) => (
        <p className="text-center text-sm font-semibold text-ink tabular-nums">
          {row.original.permissionCount}
        </p>
      ),
    },
    {
      accessorKey: 'canViewAllData',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Records they see" align="center" />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.canViewAllData ? (
            <SoftPill tone="brand">All records</SoftPill>
          ) : (
            <SoftPill tone="muted">Their own only</SoftPill>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'memberCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="People" align="center" />
      ),
      cell: ({ row }) => (
        <p className="text-center text-xs font-medium text-slate-600">
          <span className="text-sm font-semibold text-ink tabular-nums">
            {row.original.memberCount}
          </span>{' '}
          {row.original.memberCount === 1 ? 'person' : 'people'}
        </p>
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      size: 120,
      meta: { sticky: 'right' },
      header: () => <ActionColumnHeader />,
      cell: ({ row }) => (
        <StaffPermissionActionsCell group={row.original} />
      ),
    },
  ]
