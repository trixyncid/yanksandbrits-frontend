import type { ColumnDef } from '@tanstack/react-table'
import { FileImage } from 'lucide-react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { formatCurrencyAmount } from '../../../shared/lib/currency'
import { cn } from '../../../shared/lib/cn'
import {
  firstProofUrl,
  planAmountDue,
  planStatusTone,
  proofCount,
  summarizeTerms,
} from '../lib/payment-display'
import { getInitials, pillToneFor, planStatusCopy } from '../lib/payment-ui'
import type { StudentPaymentListItem } from '../types/student-payment'
import { StatusPill, TermDots } from './payment-ui'
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export const studentPaymentListColumns: ColumnDef<StudentPaymentListItem>[] = [
  {
    id: 'studentDetail',
    accessorFn: (row) => `${row.studentName} ${row.studentPin} ${row.title}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => {
      const isProspect =
        Boolean(row.original.prospectiveStudentId) && !row.original.studentId
      return (
        <div className="flex min-w-[15rem] items-center gap-3 py-0.5">
          <div
            className={cn(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tracking-wide',
              isProspect ? 'bg-brand-50 text-brand-700' : 'bg-ink text-white',
            )}
          >
            {getInitials(row.original.studentName)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-ink">
                {row.original.studentName || '—'}
              </p>
              {row.original.studentPin ? (
                <span className="rounded-full bg-canvas px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                  {row.original.studentPin}
                </span>
              ) : null}
              {isProspect ? (
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                  Prospect
                </span>
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
      <DataTableColumnHeader column={column} title="Due / Paid" />
    ),
    cell: ({ row }) => {
      const due = planAmountDue(
        row.original.fullAmount,
        row.original.discountAmount,
        row.original.linkedPredictionTestAmount,
      )
      const covered = row.original.fullAmount > 0 && due === 0
      const owed = Math.max(0, due - row.original.paidAmount)
      const reduced = due !== row.original.fullAmount
      return (
        <div className="w-48">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-bold text-ink tabular-nums">
              {formatCurrencyAmount(due)}
            </p>
            {reduced ? (
              <p
                className="truncate text-[11px] text-slate-400 line-through tabular-nums"
                title="Course fee before discount and pretest credit"
              >
                {formatCurrencyAmount(row.original.fullAmount)}
              </p>
            ) : null}
          </div>
          <div className="mt-1.5">
            <PaymentProgress
              paidAmount={covered ? 1 : row.original.paidAmount}
              fullAmount={covered ? 1 : due}
              compact
            />
          </div>
          <p className="mt-1 flex justify-between gap-2 text-[11px] font-medium tabular-nums">
            <span className="text-emerald-700">
              Paid {formatCurrencyAmount(row.original.paidAmount)}
            </span>
            {owed > 0 ? (
              <span className="text-amber-700">
                Owes {formatCurrencyAmount(owed)}
              </span>
            ) : null}
          </p>
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
      <div className="flex justify-center">
        <StatusPill tone={pillToneFor(planStatusTone(row.original.status))}>
          {planStatusCopy(row.original.status)}
        </StatusPill>
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
      <div className="mx-auto max-w-52 space-y-1.5 text-center">
        <TermDots row={row.original} />
        <p className="text-xs text-slate-500">
          {summarizeTerms(row.original.terms)}
        </p>
        {row.original.installmentPlan === 'two' ? (
          <div className="flex justify-center">
            <StatusPill
              tone={
                row.original.installmentPlanApproved ? 'success' : 'warning'
              }
            >
              {row.original.installmentPlanApproved
                ? '2-payment plan approved'
                : 'Awaiting approval'}
            </StatusPill>
          </div>
        ) : null}
      </div>
    ),
  },
  {
    id: 'paymentProof',
    accessorFn: (row) => proofCount(row.terms),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proof" align="center" />
    ),
    cell: ({ row }) => {
      const count = proofCount(row.original.terms)
      const url = firstProofUrl(row.original.terms)

      if (count === 0) {
        return (
          <span className="block text-center text-xs font-medium text-slate-400">
            None
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
            title="Open payment proof in a new tab"
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-canvas px-3 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white"
          >
            <FileImage className="size-3.5" />
            {count === 1 ? 'View' : `${count} files`}
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
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" align="center" />
    ),
    cell: ({ row }) => (
      <div
        className="text-center"
        title={formatDateTime(row.original.createdAt)}
      >
        <p className="text-xs font-semibold text-slate-700">
          {formatDate(row.original.createdAt)}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          by {row.original.createdBy || '—'}
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
    cell: ({ row }) => <StudentPaymentActionsCell payment={row.original} />,
  },
]
