import type { ColumnDef } from '@tanstack/react-table'
import { FileImage } from 'lucide-react'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { formatCurrencyAmount } from '../../../shared/lib/currency'
import {
  firstProofUrl,
  planStatusLabel,
  planStatusTone,
  proofCount,
  summarizeTerms,
} from '../lib/payment-display'
import type { StudentPaymentListItem } from '../types/student-payment'
import { StudentPaymentActionsCell } from './student-payment-actions-cell'
import { PaymentProgress } from './student-payment-terms-fields'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
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
    id: 'amount',
    accessorFn: (row) => row.fullAmount,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Paid / Planned" align="center" />
    ),
    cell: ({ row }) => (
      <div className="mx-auto w-40 text-center">
        <p className="text-xs font-semibold text-slate-800 tabular-nums">
          {formatCurrencyAmount(row.original.paidAmount)}
          <span className="font-medium text-slate-400">
            {' '}
            / {formatCurrencyAmount(row.original.fullAmount)}
          </span>
        </p>
        <div className="mt-1.5">
          <PaymentProgress
            paidAmount={row.original.paidAmount}
            fullAmount={row.original.fullAmount}
            compact
          />
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Plan" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableBadge tone={planStatusTone(row.original.status)}>
          {planStatusLabel(row.original.status)}
        </DataTableBadge>
      </div>
    ),
  },
  {
    id: 'terms',
    accessorFn: (row) => row.terms.length,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Installments"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="mx-auto max-w-48 text-center text-xs text-slate-500">
        {summarizeTerms(row.original.terms)}
      </p>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Created"
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
    accessorFn: (row) => proofCount(row.terms),
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Proof"
        align="center"
      />
    ),
    cell: ({ row }) => {
      const count = proofCount(row.original.terms)
      const url = firstProofUrl(row.original.terms)

      if (count === 0) {
        return (
          <span className="block text-center text-xs font-medium text-slate-400">
            -
          </span>
        )
      }

      if (!url) {
        return (
          <span className="block text-center text-xs font-medium text-slate-500">
            {count} file{count === 1 ? '' : 's'}
          </span>
        )
      }

      return (
        <div className="flex justify-center">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B2A5A] transition hover:text-[#253CA1]"
          >
            <FileImage className="size-3.5" />
            {count === 1 ? 'IMG' : `${count} files`}
          </a>
        </div>
      )
    },
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
    cell: ({ row }) => <StudentPaymentActionsCell payment={row.original} />,
  },
]
