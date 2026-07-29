import type { ColumnDef } from '@tanstack/react-table'
import { FileDown } from 'lucide-react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { notify } from '../../../shared/lib/notify'
import type { MarketingReportListItem } from '../types/marketing-report'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const marketingReportListColumns: ColumnDef<MarketingReportListItem>[] =
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
          title="Number of Students"
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
          title="Bonus Salary"
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
          title="Total Salary"
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
          <button
            type="button"
            onClick={() =>
              notify('info', {
                title: 'Export PDF placeholder',
                description: `${row.original.marketerName} salary PDF will be connected later.`,
              })
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F5A94] transition hover:text-[#4274B9]"
          >
            <FileDown className="size-3.5" />
            PDF
          </button>
        </div>
      ),
    },
  ]
