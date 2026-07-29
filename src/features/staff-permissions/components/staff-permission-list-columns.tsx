import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Trash2 } from 'lucide-react'

import {
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import type { StaffPermissionListItem } from '../types/staff-permission'

export const staffPermissionListColumns: ColumnDef<StaffPermissionListItem>[] =
  [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Staff Group Name"
          align="center"
        />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">
            {row.original.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {row.original.permissionCount} permissions ·{' '}
            {row.original.memberCount} members
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
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            aria-label={`View group ${row.original.name}`}
            onClick={() =>
              notify('info', {
                title: 'View staff permission placeholder',
                description: `${row.original.name} permission editor will be added later.`,
              })
            }
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
          >
            <Eye className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label={`Delete group ${row.original.name}`}
            onClick={() =>
              requestDeleteConfirm({
                title: 'Delete staff permission?',
                description: `This will permanently remove ${row.original.name}. This action cannot be undone.`,
                onConfirm: () =>
                  notify('success', {
                    title: 'Staff permission deleted',
                    description: `${row.original.name} has been removed (placeholder).`,
                  }),
              })
            }
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ),
    },
  ]
