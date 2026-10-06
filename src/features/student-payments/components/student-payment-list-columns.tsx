import type { ColumnDef } from '@tanstack/react-table'
import { FileImage } from 'lucide-react'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { formatCurrencyAmount } from '../../../shared/lib/currency'
import {
  firstProofUrl,
  planAmountDue,
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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export const studentPaymentListColumns: ColumnDef<StudentPaymentListItem>[] = [
  {
    id: 'studentDetail',
    accessorFn: (row) => `${row.studentName} ${row.studentPin} ${row.title}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student's Detail" />
    ),
    cell: ({ row }) => {
      const isProspect =
        Boolean(row.original.prospectiveStudentId) && !row.original.studentId
      return (
        <div className="flex min-w-[14rem] items-center gap-2.5 py-0.5">
          <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#253CA1] text-[11px] font-bold tracking-wide text-white shadow-sm shadow-[#253CA1]/20">
            {getInitials(row.original.studentName)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-900">
                {row.original.studentName || '—'}
              </p>
              {row.original.studentPin ? (
                <span className="rounded-full bg-[#E8EEFF] px-2 py-0.5 text-[11px] font-semibold text-[#253CA1]">
                  {row.original.studentPin}
                </span>
              ) : null}
              {isProspect ? (
                <DataTableBadge tone="primary">Prospect</DataTableBadge>
              ) : null}
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {row.original.title || '—'}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    id: 'amount',
    accessorFn: (row) => row.fullAmount,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full / Paid" align="center" />
    ),
    cell: ({ row }) => {
      const due = planAmountDue(
        row.original.fullAmount,
        row.original.discountAmount,
        row.original.linkedPredictionTestAmount,
      )
      const covered = row.original.fullAmount > 0 && due === 0
      return (
        <div className="mx-auto w-44 text-center">
          <p className="text-xs font-semibold text-slate-800 tabular-nums">
            {formatCurrencyAmount(row.original.fullAmount)}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500 tabular-nums">
            Paid {formatCurrencyAmount(row.original.paidAmount)}
          </p>
          <div className="mt-1.5">
            <PaymentProgress
              paidAmount={covered ? 1 : row.original.paidAmount}
              fullAmount={covered ? 1 : due}
              compact
            />
          </div>
        </div>
      )
    },
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
      <div className="mx-auto max-w-48 text-center">
        <p className="text-xs text-slate-500">
          {summarizeTerms(row.original.terms)}
        </p>
        {row.original.installmentPlan === 'two' ? (
          <div className="mt-1.5">
            <DataTableBadge
              tone={
                row.original.installmentPlanApproved ? 'success' : 'warning'
              }
            >
              {row.original.installmentPlanApproved
                ? 'Plan approved'
                : 'Awaiting approval'}
            </DataTableBadge>
          </div>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Created At"
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
