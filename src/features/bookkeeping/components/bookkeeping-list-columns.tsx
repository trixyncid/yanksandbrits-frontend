import type { ColumnDef } from '@tanstack/react-table'
import { Eye, FileText, Trash2, Users } from 'lucide-react'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import type {
  BookkeepingListItem,
  BookkeepingStatus,
} from '../types/bookkeeping'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function statusTone(status: BookkeepingStatus) {
  if (status === 'approved') {
    return 'success' as const
  }

  if (status === 'pending') {
    return 'info' as const
  }

  return 'danger' as const
}

function statusLabel(status: BookkeepingStatus) {
  if (status === 'approved') {
    return 'Approved'
  }

  if (status === 'pending') {
    return 'Pending'
  }

  return 'Void'
}

export const bookkeepingListColumns: ColumnDef<BookkeepingListItem>[] = [
  {
    id: 'dateRange',
    accessorFn: (row) => `${row.startDate} ${row.endDate}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date Range" />
    ),
    cell: ({ row }) => (
      <p className="ps-1 text-sm font-semibold text-slate-900">
        {formatDate(row.original.startDate)} -{' '}
        {formatDate(row.original.endDate)}
      </p>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableBadge tone={statusTone(row.original.status)}>
          {statusLabel(row.original.status)}
        </DataTableBadge>
      </div>
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
        title="Date Updated"
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
        {row.original.createdBy}
      </p>
    ),
  },
  {
    id: 'actions',
    enableSorting: false,
    size: 176,
    meta: { sticky: 'right' },
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        Action
      </span>
    ),
    cell: () => (
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label="View bookkeeping"
          onClick={() =>
            notify('info', {
              title: 'View bookkeeping placeholder',
              description: 'Bookkeeping detail will be added later.',
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
        >
          <Eye className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="View tutor report"
          onClick={() =>
            notify('info', {
              title: 'Tutor report placeholder',
              description: 'Period tutor report link will be added later.',
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-amber-600 transition hover:border-amber-200 hover:bg-amber-50"
        >
          <FileText className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="View marketing report"
          onClick={() =>
            notify('info', {
              title: 'Marketing report placeholder',
              description: 'Period marketing report link will be added later.',
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
        >
          <Users className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="Delete bookkeeping"
          onClick={() =>
            requestDeleteConfirm({
              title: 'Delete bookkeeping?',
              description:
                'This will permanently remove this bookkeeping entry. This action cannot be undone.',
              onConfirm: () =>
                notify('success', {
                  title: 'Bookkeeping deleted',
                  description:
                    'The bookkeeping entry has been removed (placeholder).',
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
