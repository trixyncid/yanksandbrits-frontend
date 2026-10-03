import type { ColumnDef } from '@tanstack/react-table'

import {
  courseLabel,
  isSatCourse,
  isToeflCourse,
} from '../../../shared/api/choices'
import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import type {
  AcademicLeaderStatus,
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

function academicLeaderStatusTone(
  status: AcademicLeaderStatus,
  decision: PredictionTestListItem['academicLeaderDecision'],
) {
  if (decision === 'reject') {
    return 'warning' as const
  }
  if (decision === 'approve' || status === 'reviewed') {
    return 'success' as const
  }
  return 'info' as const
}

function academicLeaderStatusLabel(
  status: AcademicLeaderStatus,
  decision: PredictionTestListItem['academicLeaderDecision'],
) {
  if (decision === 'reject') {
    return 'Changes requested'
  }
  if (decision === 'approve') {
    return 'Proceed'
  }
  if (status === 'reviewed') {
    return 'Reviewed'
  }
  return 'Pending Review'
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function getPredictionTestListColumns(options?: {
  hidePayment?: boolean
}): ColumnDef<PredictionTestListItem>[] {
  const hidePayment = Boolean(options?.hidePayment)

  const columns: ColumnDef<PredictionTestListItem>[] = [
  {
    id: 'studentDetail',
    accessorFn: (row) =>
      `${row.studentName} ${row.studentEmail} ${row.studentPhone}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student's Detail" />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-[14rem] items-center gap-2.5 py-0.5">
        <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#253CA1] text-[11px] font-bold tracking-wide text-white shadow-sm shadow-[#253CA1]/20">
          {getInitials(row.original.studentName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {row.original.studentName}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {row.original.studentEmail || '—'}
          </p>
          <p className="truncate text-xs text-slate-500">
            {row.original.studentPhone}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'predictionTest',
    accessorFn: (row) => courseLabel(row.studentCourse),
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Prediction Test"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="mx-auto max-w-52 text-center text-xs font-medium text-slate-700">
        {courseLabel(row.original.studentCourse)}
      </p>
    ),
  },
  {
    id: 'skills',
    accessorFn: (row) =>
      [row.listening, row.reading, row.writing, row.speaking, row.math]
        .map((value) => (value == null ? '' : String(value)))
        .join(' '),
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Test Scores"
        align="center"
      />
    ),
    cell: ({ row }) => {
      const toefl = isToeflCourse(row.original.studentCourse)
      const sat = isSatCourse(row.original.studentCourse)
      const skills = sat
        ? [
            { label: 'RW', value: row.original.reading },
            { label: 'M', value: row.original.math },
          ]
        : toefl
          ? [
              { label: 'L', value: row.original.listening },
              { label: 'W', value: row.original.writing },
              { label: 'R', value: row.original.reading },
            ]
          : [
              { label: 'L', value: row.original.listening },
              { label: 'W', value: row.original.writing },
              { label: 'R', value: row.original.reading },
              { label: 'S', value: row.original.speaking },
            ]
      const hasAny = skills.some((skill) => skill.value != null)

      if (!hasAny) {
        return (
          <p className="text-center text-xs font-medium text-slate-400">-</p>
        )
      }

      return (
        <div className="mx-auto flex w-max items-center gap-1 whitespace-nowrap">
          {skills.map((skill) => (
            <span
              key={skill.label}
              className="inline-flex items-center gap-0.5 rounded-md bg-[#F5F8FF] px-1.5 py-0.5 text-[11px] leading-none tabular-nums ring-1 ring-[#C8D4F5]/80"
            >
              <span className="font-semibold text-[#253CA1]">{skill.label}</span>
              <span className="font-medium text-slate-700">
                {skill.value == null ? '—' : skill.value}
              </span>
            </span>
          ))}
        </div>
      )
    },
  },
  ]

  if (!hidePayment) {
    columns.push(
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Payment Status"
            align="center"
          />
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <DataTableBadge tone={statusTone(row.original.status)}>
              {statusLabel(row.original.status)}
            </DataTableBadge>
          </div>
        ),
      },
    )
  }

  if (!hidePayment) {
    columns.push({
      id: 'managerApproval',
      accessorFn: (row) => (row.managerApproved ? 'approved' : 'pending'),
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Manager Approval"
          align="center"
        />
      ),
      cell: ({ row }) => (
        <div className="text-center">
          <DataTableBadge
            tone={row.original.managerApproved ? 'success' : 'info'}
          >
            {row.original.managerApproved ? 'Approved' : 'Pending'}
          </DataTableBadge>
        </div>
      ),
    })
  }

  columns.push({
    id: 'academicLeaderStatus',
    accessorFn: (row) => row.academicLeaderStatus,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Academic Leader Status"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableBadge
          tone={academicLeaderStatusTone(
            row.original.academicLeaderStatus,
            row.original.academicLeaderDecision,
          )}
        >
          {academicLeaderStatusLabel(
            row.original.academicLeaderStatus,
            row.original.academicLeaderDecision,
          )}
        </DataTableBadge>
      </div>
    ),
  })

  columns.push(
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
  )

  if (!hidePayment) {
    columns.push({
      accessorKey: 'branch',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Branch" align="center" />
      ),
      cell: ({ row }) => (
        <p className="text-center text-xs font-medium text-slate-600">
          {row.original.branch}
        </p>
      ),
    })
  }

  columns.push({
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
  })

  return columns
}

export const predictionTestListColumns = getPredictionTestListColumns()
