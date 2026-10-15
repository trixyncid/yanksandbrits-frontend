import type { ColumnDef } from '@tanstack/react-table'
import { CalendarRange } from 'lucide-react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { StatusPill } from '../../student-payments/components/payment-ui'
import {
  bookkeepingStatusLabel,
  bookkeepingStatusTone,
  formatPeriodDate,
  formatPeriodDateTime,
  periodLengthDays,
} from '../lib/bookkeeping-status'
import type { BookkeepingListItem } from '../types/bookkeeping'
import { BookkeepingActionsCell } from './bookkeeping-list-cells'

export const bookkeepingListColumns: ColumnDef<BookkeepingListItem>[] = [
  {
    id: 'dateRange',
    accessorFn: (row) => `${row.startDate} ${row.endDate}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Period" />
    ),
    cell: ({ row }) => {
      const days = periodLengthDays(row.original.startDate, row.original.endDate)
      const range = `${formatPeriodDate(row.original.startDate)} – ${formatPeriodDate(row.original.endDate)}`
      return (
        <div className="flex min-w-[15rem] items-center gap-3 py-0.5">
          <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink text-white">
            <CalendarRange className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {row.original.title.trim() || range}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {row.original.title.trim() ? range : 'Payroll period'}
              {days ? ` · ${days} day${days === 1 ? '' : 's'}` : ''}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" align="center" />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StatusPill tone={bookkeepingStatusTone(row.original.status)}>
          {bookkeepingStatusLabel(row.original.status)}
        </StatusPill>
      </div>
    ),
  },
  {
    accessorKey: 'branchName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.branchName && row.original.branchName !== '—'
          ? row.original.branchName
          : 'All branches'}
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
        title={formatPeriodDateTime(row.original.createdAt)}
      >
        <p className="text-xs font-semibold text-slate-700">
          {formatPeriodDate(row.original.createdAt)}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          by {row.original.createdBy || '—'}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Last Updated"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatPeriodDateTime(row.original.updatedAt)}
      </p>
    ),
  },
  {
    id: 'actions',
    enableSorting: false,
    size: 196,
    meta: { sticky: 'right' },
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        Action
      </span>
    ),
    cell: ({ row }) => <BookkeepingActionsCell item={row.original} />,
  },
]
