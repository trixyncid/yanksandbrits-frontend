import type { ColumnDef } from '@tanstack/react-table'
import { FileDown } from 'lucide-react'
import { useState } from 'react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { downloadMarketingSalaryPdf } from '../../marketing-report/api/marketing-report-api'
import type { BookkeepingMarketingSalaryItem } from '../types/bookkeeping'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function MarketingPdfButton({
  item,
}: {
  item: BookkeepingMarketingSalaryItem
}) {
  const [isDownloading, setIsDownloading] = useState(false)

  return (
    <button
      type="button"
      disabled={isDownloading}
      onClick={() => {
        void (async () => {
          setIsDownloading(true)
          try {
            await downloadMarketingSalaryPdf(
              {
                id: item.id,
                marketerId: null,
                source: 'bookkeeping',
                marketerPin: item.marketerPin,
              },
              `marketing-salary-${item.marketerPin}.pdf`,
            )
            notify('success', {
              title: 'PDF downloaded',
              description: `${item.marketerName} salary report saved.`,
            })
          } catch (error) {
            notify('error', {
              title: 'Unable to download PDF',
              description: getApiErrorMessage(error),
            })
          } finally {
            setIsDownloading(false)
          }
        })()
      }}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F5A94] transition hover:text-[#4274B9] disabled:opacity-60"
    >
      <FileDown className="size-3.5" />
      {isDownloading ? '…' : 'PDF'}
    </button>
  )
}

export const bookkeepingMarketingSalaryColumns: ColumnDef<BookkeepingMarketingSalaryItem>[] =
  [
    {
      id: 'marketer',
      accessorFn: (row) => `${row.marketerPin} ${row.marketerName}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Marketer" />
      ),
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {row.original.marketerPin} - {row.original.marketerName}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'totalStudent',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Students"
          align="center"
        />
      ),
      cell: ({ row }) => (
        <p className="text-center text-xs font-medium text-slate-600">
          {row.original.totalStudent}
        </p>
      ),
    },
    {
      accessorKey: 'mainSalary',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Main Salary"
          align="center"
        />
      ),
      cell: ({ row }) => (
        <p className="text-center text-xs font-medium text-slate-600 tabular-nums">
          {formatCurrency(row.original.mainSalary)}
        </p>
      ),
    },
    {
      accessorKey: 'bonusSalary',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Bonus"
          align="center"
        />
      ),
      cell: ({ row }) => (
        <p className="text-center text-xs font-medium text-slate-600 tabular-nums">
          {formatCurrency(row.original.bonusSalary)}
        </p>
      ),
    },
    {
      accessorKey: 'totalSalary',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Total"
          align="center"
        />
      ),
      cell: ({ row }) => (
        <p className="text-center text-xs font-semibold text-slate-800 tabular-nums">
          {formatCurrency(row.original.totalSalary)}
        </p>
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      size: 96,
      meta: { sticky: 'right' },
      header: () => (
        <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
          Action
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <MarketingPdfButton item={row.original} />
        </div>
      ),
    },
  ]
