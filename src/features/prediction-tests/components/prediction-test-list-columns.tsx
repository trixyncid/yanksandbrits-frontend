import { parseISO } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'

import {
  courseLabel,
  isComputerScienceCourse,
  isGeneralEnglishCourse,
  isNoneCourse,
  isSatCourse,
  isToeflCourse,
} from '../../../shared/api/choices'
import { DataTableColumnHeader } from '../../../shared/components/data-table'
import type { PredictionTestListItem } from '../types/prediction-test'
import { PredictionTestActionsCell } from './prediction-test-actions-cell'
import { PredictionTestStatusPill } from './prediction-test-status-pill'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

/** "2026-10-05" -> "Paid Oct 5, 2026", read as a local date. */
function formatPaymentDate(value: string) {
  return `Paid ${new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parseISO(value))}`
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
      <DataTableColumnHeader column={column} title="Student" />
    ),
    cell: ({ row }) => (
      <div className="flex min-w-[14rem] items-center gap-2.5 py-0.5">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold tracking-wide text-brand-700 ring-4 ring-canvas">
          {getInitials(row.original.studentName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {row.original.studentName}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {[row.original.studentPhone, row.original.studentEmail]
              .filter(Boolean)
              .join(' · ') || '—'}
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
        title="Test type"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <span className="inline-flex max-w-52 rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink">
          <span className="truncate">
            {courseLabel(row.original.studentCourse)}
          </span>
        </span>
      </div>
    ),
  },
  {
    id: 'skills',
    accessorFn: (row) => {
      if (isComputerScienceCourse(row.studentCourse) || isNoneCourse(row.studentCourse)) {
        return ''
      }
      if (isGeneralEnglishCourse(row.studentCourse)) {
        return row.writtenTestScore == null ? '' : `WT ${row.writtenTestScore}`
      }
      return [row.listening, row.reading, row.writing, row.speaking, row.math]
        .map((value) => (value == null ? '' : String(value)))
        .join(' ')
    },
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Scores"
        align="center"
      />
    ),
    cell: ({ row }) => {
      if (
        isComputerScienceCourse(row.original.studentCourse) ||
        isNoneCourse(row.original.studentCourse)
      ) {
        return (
          <p className="text-center text-xs font-medium text-slate-400">-</p>
        )
      }
      if (isGeneralEnglishCourse(row.original.studentCourse)) {
        const writtenTest = row.original.writtenTestScore
        if (writtenTest == null) {
          return (
            <p className="text-center text-xs font-medium text-slate-400">-</p>
          )
        }
        return (
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-1 text-[11px] leading-none tabular-nums">
              <span className="font-semibold text-brand-600">WT</span>
              <span className="font-semibold text-ink">{writtenTest}</span>
            </span>
          </div>
        )
      }
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
              className="inline-flex items-center gap-1 rounded-full bg-canvas px-2 py-1 text-[11px] leading-none tabular-nums"
            >
              <span className="font-semibold text-brand-600">{skill.label}</span>
              <span className="font-semibold text-ink">
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
            title="Payment"
            align="center"
          />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col items-center gap-1">
            <PredictionTestStatusPill status={row.original.status} />
            {row.original.paymentDate ? (
              <span className="text-[11px] font-medium text-slate-500">
                {formatPaymentDate(row.original.paymentDate)}
              </span>
            ) : null}
          </div>
        ),
      },
    )
  }

  columns.push(
  {
    accessorKey: 'educationCounsellor',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Counsellor"
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
        title="Created"
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
        <div className="text-center">
          {row.original.branch && row.original.branch !== '—' ? (
            <span className="inline-flex rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-slate-600">
              {row.original.branch}
            </span>
          ) : (
            <span className="text-xs text-slate-400">-</span>
          )}
        </div>
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
