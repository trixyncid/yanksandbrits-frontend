import type { ColumnDef } from '@tanstack/react-table'
import { useQueryClient } from '@tanstack/react-query'
import { CalendarRange, Eye, FileText, Trash2, Users } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { deleteBookkeeping } from '../api/bookkeeping-api'
import { bookkeepingQueryKeys } from '../api/bookkeeping-query-keys'
import { StatusPill } from '../../student-payments/components/payment-ui'
import {
  bookkeepingStatusLabel,
  bookkeepingStatusTone,
  formatPeriodDate,
  formatPeriodDateTime,
  periodLengthDays,
} from '../lib/bookkeeping-status'
import type { BookkeepingListItem } from '../types/bookkeeping'

function BookkeepingActionsCell({ item }: { item: BookkeepingListItem }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const periodName =
    item.title.trim() ||
    `${formatPeriodDate(item.startDate)} – ${formatPeriodDate(item.endDate)}`

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        aria-label={`Open period ${periodName}`}
        title="Open period"
        onClick={() =>
          void navigate({
            to: '/bookkeeping/$bookkeepingId',
            params: { bookkeepingId: item.id },
          })
        }
        className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
      >
        <Eye className="size-3.5" />
      </button>
      <Link
        to="/tutor-report"
        aria-label="Open tutor salary report"
        title="Tutor salary report"
        className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
      >
        <FileText className="size-3.5" />
      </Link>
      <Link
        to="/marketing-report"
        aria-label="Open education counsellor salary report"
        title="Education counsellor salary report"
        className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
      >
        <Users className="size-3.5" />
      </Link>
      <button
        type="button"
        aria-label={`Delete period ${periodName}`}
        title="Delete period"
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete bookkeeping period?',
            description: `This will permanently remove ${periodName} and its salary calculations. This cannot be undone.`,
            onConfirm: () => {
              void (async () => {
                try {
                  await deleteBookkeeping(item.id)
                  await queryClient.invalidateQueries({
                    queryKey: bookkeepingQueryKeys.all,
                  })
                  notify('success', {
                    title: 'Bookkeeping deleted',
                    description: `${periodName} has been removed.`,
                  })
                } catch (error) {
                  notify('error', {
                    title: 'Unable to delete bookkeeping',
                    description: getApiErrorMessage(error),
                  })
                }
              })()
            },
          })
        }
        className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-rose-500 transition hover:bg-rose-500 hover:text-white"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}

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
