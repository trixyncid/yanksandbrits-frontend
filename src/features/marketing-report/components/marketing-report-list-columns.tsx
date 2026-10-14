import type { ColumnDef } from '@tanstack/react-table'
import { FileDown } from 'lucide-react'
import { useState } from 'react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { downloadMarketingSalaryPdf } from '../api/marketing-report-api'
import { getInitials } from '../../student-payments/lib/payment-ui'
import type { MarketingReportListItem } from '../types/marketing-report'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function MarketingPdfButton({ item }: { item: MarketingReportListItem }) {
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
              item,
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
      title="Download salary PDF"
      aria-label={`Download salary PDF for ${item.marketerName}`}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-canvas px-3.5 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white disabled:cursor-wait disabled:opacity-60"
    >
      <FileDown className="size-3.5" />
      {isDownloading ? 'Saving…' : 'PDF'}
    </button>
  )
}

export const marketingReportListColumns: ColumnDef<MarketingReportListItem>[] =
  [
    {
      id: 'marketer',
      accessorFn: (row) => `${row.marketerPin} ${row.marketerName}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Education counsellor" />
      ),
      cell: ({ row }) => (
        <div className="flex min-w-[14rem] items-center gap-3 py-0.5">
          <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-bold text-ink">
            {getInitials(row.original.marketerName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {row.original.marketerName}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              <span className="font-mono">{row.original.marketerPin}</span>
              {row.original.email && row.original.email !== '—'
                ? ` · ${row.original.email}`
                : ''}
            </p>
          </div>
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
          title="Total Pay"
          align="center"
        />
      ),
      cell: ({ row }) => (
        <p className="text-center">
          <span className="inline-flex rounded-full bg-ink px-3 py-1 text-xs font-bold text-white tabular-nums">
            {formatCurrency(row.original.totalSalary)}
          </span>
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
