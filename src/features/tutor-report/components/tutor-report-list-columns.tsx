import type { ColumnDef } from '@tanstack/react-table'
import { FileDown } from 'lucide-react'
import { useState } from 'react'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { downloadTutorSalaryPdf } from '../api/tutor-report-api'
import { getInitials } from '../../student-payments/lib/payment-ui'
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
      title="Download salary PDF"
      aria-label={`Download salary PDF for ${item.tutorName}`}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-canvas px-3.5 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white disabled:cursor-wait disabled:opacity-60"
    >
      <FileDown className="size-3.5" />
      {isDownloading ? 'Saving…' : 'PDF'}
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
      <div className="flex min-w-[14rem] items-center gap-3 py-0.5">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-bold text-ink">
          {getInitials(row.original.tutorName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {row.original.tutorName}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            <span className="font-mono">{row.original.tutorPin}</span>
            {row.original.tutorEmail && row.original.tutorEmail !== '—'
              ? ` · ${row.original.tutorEmail}`
              : ''}
          </p>
        </div>
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
        title="Sessions"
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
        title="OT Sessions"
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
        title="OT Pay"
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
