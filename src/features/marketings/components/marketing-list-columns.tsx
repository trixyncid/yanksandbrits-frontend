import type { ColumnDef } from '@tanstack/react-table'
import { BadgeDollarSign, Eye, Trash2 } from 'lucide-react'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import type { MarketingListItem } from '../types/marketing'

function formatDateTime(value: string | null) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export const marketingListColumns: ColumnDef<MarketingListItem>[] = [
  {
    id: 'marketingDetail',
    accessorFn: (row) => `${row.pin} ${row.fullName} ${row.email}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Marketing's Detail" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {row.original.pin} - {row.original.fullName}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{row.original.email}</p>
        <p className="text-xs text-slate-500">{row.original.phone || '-'}</p>
      </div>
    ),
  },
  {
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableBadge
          tone={row.original.gender === 'male' ? 'info' : 'primary'}
        >
          {row.original.gender === 'male' ? 'Male' : 'Female'}
        </DataTableBadge>
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
    accessorKey: 'lastLogin',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last Login"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDateTime(row.original.lastLogin)}
      </p>
    ),
  },
  {
    accessorKey: 'dateJoined',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Date Joined"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDate(row.original.dateJoined)}
      </p>
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
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label={`View marketing ${row.original.fullName}`}
          onClick={() =>
            notify('info', {
              title: 'View marketing placeholder',
              description: `${row.original.fullName} detail page will be added later.`,
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
        >
          <Eye className="size-3.5" />
        </button>
        {row.original.hasSalary ? (
          <button
            type="button"
            aria-label={`Edit salary for ${row.original.fullName}`}
            onClick={() =>
              notify('info', {
                title: 'Edit salary placeholder',
                description: `${row.original.fullName} salary form will be added later.`,
              })
            }
            className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-amber-600 transition hover:border-amber-200 hover:bg-amber-50"
          >
            <BadgeDollarSign className="size-3.5" />
          </button>
        ) : null}
        <button
          type="button"
          aria-label={`Delete marketing ${row.original.fullName}`}
          onClick={() =>
            requestDeleteConfirm({
              title: 'Delete marketing?',
              description: `This will permanently remove ${row.original.fullName}. This action cannot be undone.`,
              onConfirm: () =>
                notify('success', {
                  title: 'Marketing deleted',
                  description: `${row.original.fullName} has been removed (placeholder).`,
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
