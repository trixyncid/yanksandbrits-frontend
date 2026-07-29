import type { ColumnDef } from '@tanstack/react-table'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import type {
  PredictionTestListItem,
  PredictionTestStatus,
} from '../types/prediction-test'
import { PredictionTestActionsCell } from './prediction-test-actions-cell'

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

function statusTone(status: PredictionTestStatus) {
  if (status === 'approved') {
    return 'success' as const
  }

  if (status === 'pending') {
    return 'info' as const
  }

  return 'danger' as const
}

function statusLabel(status: PredictionTestStatus) {
  if (status === 'approved') {
    return 'Approved'
  }

  if (status === 'pending') {
    return 'Pending'
  }

  return 'Void'
}

export const predictionTestListColumns: ColumnDef<PredictionTestListItem>[] = [
  {
    id: 'studentDetail',
    accessorFn: (row) =>
      `${row.studentName} ${row.studentEmail} ${row.studentPhone}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student's Detail" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {row.original.studentName}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {row.original.studentEmail || '-'}
        </p>
        <p className="text-xs text-slate-500">{row.original.studentPhone}</p>
      </div>
    ),
  },
  {
    accessorKey: 'score',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Score" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.score == null ? '-' : row.original.score}
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
      <DataTableColumnHeader
        column={column}
        title="Payment Amount"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-semibold text-slate-800 tabular-nums">
        {formatCurrency(row.original.amount)}
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
    accessorKey: 'educationCounsellor',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Education Counsellor"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.educationCounsellor || '-'}
      </p>
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
    cell: ({ row }) => <PredictionTestActionsCell test={row.original} />,
  },
]
