import type { ColumnDef } from '@tanstack/react-table'
import { Eye, FileImage, Trash2 } from 'lucide-react'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { notify } from '../../../shared/lib/notify'
import type {
  StudentPaymentListItem,
  StudentPaymentStatus,
} from '../types/student-payment'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function statusTone(status: StudentPaymentStatus) {
  if (status === 'approved') {
    return 'success' as const
  }

  if (status === 'pending') {
    return 'info' as const
  }

  return 'danger' as const
}

function statusLabel(status: StudentPaymentStatus) {
  if (status === 'approved') {
    return 'Approved'
  }

  if (status === 'pending') {
    return 'Pending'
  }

  return 'Void'
}

export const studentPaymentListColumns: ColumnDef<StudentPaymentListItem>[] = [
  {
    id: 'student',
    accessorFn: (row) => `${row.studentPin} ${row.studentName}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student Detail" />
    ),
    cell: ({ row }) => (
      <p className="text-sm font-semibold text-slate-900">
        {row.original.studentPin} | {row.original.studentName}
      </p>
    ),
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.title}
      </p>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Description"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="mx-auto max-w-56 text-center text-xs text-slate-500">
        {row.original.description || '-'}
      </p>
    ),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-semibold text-slate-800 tabular-nums">
        {formatCurrency(row.original.amount)}
      </p>
    ),
  },
  {
    accessorKey: 'transactionDate',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Transaction Date"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDateTime(row.original.transactionDate)}
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
    id: 'paymentProof',
    accessorFn: (row) => (row.hasPaymentProof ? 'available' : 'missing'),
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Payment Proof"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        {row.original.hasPaymentProof ? (
          <button
            type="button"
            onClick={() =>
              notify('info', {
                title: 'Payment proof placeholder',
                description: 'Proof preview will be connected later.',
              })
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F5A94] transition hover:text-[#4274B9]"
          >
            <FileImage className="size-3.5" />
            IMG
          </button>
        ) : (
          <span className="text-xs font-medium text-slate-400">-</span>
        )}
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
          aria-label={`View payment ${row.original.title}`}
          onClick={() =>
            notify('info', {
              title: 'View payment placeholder',
              description: `${row.original.title} detail page will be added later.`,
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
        >
          <Eye className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Delete payment ${row.original.title}`}
          onClick={() =>
            notify('warning', {
              title: 'Delete payment placeholder',
              description: `${row.original.title} delete confirmation will be added later.`,
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
