import type { ColumnDef } from '@tanstack/react-table'
import { FileDown } from 'lucide-react'
import { useState } from 'react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { downloadTutorSalaryPdf } from '../api/tutor-report-api'
import type { TutorReportListItem } from '../types/tutor-report'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function TutorPdfButton({ item }: { item: TutorReportListItem }) {
  const [isDownloading, setIsDownloading] = useState(false)

  return (
    <button
      type="button"
      disabled={isDownloading}
      onClick={() => {
        void (async () => {
          setIsDownloading(true)
          try {
            await downloadTutorSalaryPdf(
              item,
              `tutor-salary-${item.tutorPin}.pdf`,
            )
            notify('success', {
              title: 'PDF downloaded',
              description: `${item.tutorName} salary report saved.`,
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

export const tutorReportListColumns: ColumnDef<TutorReportListItem>[] = [
  {
    id: 'tutor',
    accessorFn: (row) => `${row.tutorPin} ${row.tutorName}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tutor" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {row.original.tutorPin} - {row.original.tutorName}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {row.original.tutorEmail}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'workingDays',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Working Days"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.workingDays}
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
    accessorKey: 'sessions',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Number of Sessions"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.sessions}
      </p>
    ),
  },
  {
    accessorKey: 'sessionSalary',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Session Salary"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600 tabular-nums">
        {formatCurrency(row.original.sessionSalary)}
      </p>
    ),
  },
  {
    accessorKey: 'overtimeSessions',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Overtime Sessions"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {row.original.overtimeSessions}
      </p>
    ),
  },
  {
    accessorKey: 'overtimeSalary',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Overtime Salary"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600 tabular-nums">
        {formatCurrency(row.original.overtimeSalary)}
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
        <TutorPdfButton item={row.original} />
      </div>
    ),
  },
]
