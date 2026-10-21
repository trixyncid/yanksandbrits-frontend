import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import { getInitials } from '../../student-payments/lib/payment-ui'
import type { BookkeepingStaffSalaryItem } from '../api/staff-salary-api'
import { StaffPdfButton } from './staff-salary-pdf-button'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const bookkeepingStaffSalaryColumns: ColumnDef<BookkeepingStaffSalaryItem>[] = [
  {
    id: 'staff',
    accessorFn: (row) => `${row.staffPin} ${row.staffName} ${row.staffEmail}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Staff" />,
    cell: ({ row }) => (
      <div className="flex min-w-[14rem] items-center gap-3 py-0.5">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-bold text-ink">
          {getInitials(row.original.staffName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{row.original.staffName}</p>
          <p className="truncate text-xs text-slate-500">
            {row.original.staffPin ? `${row.original.staffPin} · ` : ''}
            {row.original.staffEmail}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'role',
    accessorFn: (row) => row.roles.join(', '),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" align="center" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-wrap justify-center gap-1">
        {row.original.roles.map((role) => (
          <span
            key={role}
            className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"
          >
            {role}
          </span>
        ))}
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
        {row.original.branchName || '—'}
      </p>
    ),
  },
  {
    accessorKey: 'mainSalary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Base salary" align="right" />
    ),
    cell: ({ row }) => (
      <p className="text-right text-sm font-medium text-slate-600 tabular-nums">
        {formatCurrency(row.original.mainSalary)}
      </p>
    ),
  },
  {
    accessorKey: 'bonusSalary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Leader bonus" align="right" />
    ),
    cell: ({ row }) =>
      row.original.bonusSalary > 0 || row.original.tutorHeadcount > 0 ? (
        <div className="text-right">
          <p className="text-sm font-medium text-slate-600 tabular-nums">
            {formatCurrency(row.original.bonusSalary)}
          </p>
          <p className="text-[11px] text-slate-400">
            {row.original.tutorHeadcount} tutor
            {row.original.tutorHeadcount === 1 ? '' : 's'} hit bonus
          </p>
        </div>
      ) : (
        <p className="text-right text-xs text-slate-400">—</p>
      ),
  },
  {
    accessorKey: 'commissionSalary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Commission" align="right" />
    ),
    cell: ({ row }) =>
      row.original.commissionSalary > 0 || row.original.enrollmentCount > 0 ? (
        <div className="text-right">
          <p className="text-sm font-medium text-slate-600 tabular-nums">
            {formatCurrency(row.original.commissionSalary)}
          </p>
          <p className="text-[11px] text-slate-400">
            {row.original.enrollmentCount} new student
            {row.original.enrollmentCount === 1 ? '' : 's'} ×{' '}
            {formatCurrency(row.original.commissionRate)}
          </p>
        </div>
      ) : (
        <p className="text-right text-xs text-slate-400">—</p>
      ),
  },
  {
    accessorKey: 'trainingSalary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Training pay" align="right" />
    ),
    cell: ({ row }) =>
      row.original.trainingSessions > 0 ? (
        <div className="text-right">
          <p className="text-sm font-medium text-slate-600 tabular-nums">
            {formatCurrency(row.original.trainingSalary)}
          </p>
          <p className="text-[11px] text-slate-400">
            {row.original.trainingSessions} training session
            {row.original.trainingSessions === 1 ? '' : 's'}
          </p>
        </div>
      ) : (
        <p className="text-right text-xs text-slate-400">—</p>
      ),
  },
  {
    accessorKey: 'totalSalary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" align="right" />
    ),
    cell: ({ row }) => (
      <p className="text-right text-sm font-bold text-ink tabular-nums">
        {formatCurrency(row.original.totalSalary)}
      </p>
    ),
  },
  {
    id: 'actions',
    enableSorting: false,
    size: 110,
    meta: { sticky: 'right' },
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        Report
      </span>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StaffPdfButton item={row.original} />
      </div>
    ),
  },
]
