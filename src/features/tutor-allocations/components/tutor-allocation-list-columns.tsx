import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '../../../shared/components/data-table'
import {
  ALLOCATION_STAGE_HINT,
  ALLOCATION_STAGE_LABEL,
  allocationStage,
} from '../lib/allocation-status'
import { programLabel } from '../lib/programs'
import type { TutorAllocationListItem } from '../types/tutor-allocation'
import { AllocationStagePill } from './allocation-stage-pill'
import { TutorAllocationActionsCell } from './tutor-allocation-actions-cell'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function studentNames(row: TutorAllocationListItem) {
  return row.members.map((member) => member.studentName).filter(Boolean)
}

export const tutorAllocationListColumns: ColumnDef<TutorAllocationListItem>[] = [
  {
    id: 'studentRecord',
    accessorFn: (row) => studentNames(row).join(' '),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Student Record" />
    ),
    cell: ({ row }) => {
      const names = studentNames(row.original)
      const pins = row.original.members
        .map((member) => member.pin)
        .filter(Boolean)
      const label = names.length > 0 ? names.join(', ') : 'No students'
      const typeLabel =
        row.original.classType === 'private'
          ? 'Private'
          : `Group of ${row.original.groupSize}`

      const extra = Math.max(names.length - 1, 0)

      return (
        <div className="flex min-w-[15rem] items-center gap-3 py-0.5">
          {/* Stacked avatars hint at group size at a glance. */}
          <div className="relative shrink-0">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold tracking-wide text-white ring-2 ring-white">
              {getInitials(names[0] ?? label)}
            </div>
            {extra > 0 ? (
              <span className="absolute -right-1.5 -bottom-1 inline-flex size-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white ring-2 ring-white">
                +{extra}
              </span>
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="max-w-[16rem] truncate text-sm font-semibold text-ink">
                {label}
              </p>
              <span className="inline-flex rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {typeLabel}
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {pins.length > 0 ? pins.join(', ') : '—'}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    id: 'program',
    accessorFn: (row) => programLabel(row.program),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Program" align="center" />
    ),
    cell: ({ row }) => {
      const catalog = [
        ...row.original.computerSciencePrograms.map((line) =>
          [line.programCode, line.programTitle].filter(Boolean).join(' · '),
        ),
        [row.original.listeningProgramCode, row.original.listeningProgramTitle],
        [row.original.readingProgramCode, row.original.readingProgramTitle],
        [row.original.writingProgramCode, row.original.writingProgramTitle],
        [row.original.speakingProgramCode, row.original.speakingProgramTitle],
        [row.original.mathProgramCode, row.original.mathProgramTitle],
        [
          row.original.generalEnglishUnit1ProgramCode,
          row.original.generalEnglishUnit1ProgramTitle,
        ],
        [
          row.original.generalEnglishUnit2ProgramCode,
          row.original.generalEnglishUnit2ProgramTitle,
        ],
        [
          row.original.generalEnglishGrammarProgramCode,
          row.original.generalEnglishGrammarProgramTitle,
        ],
      ]
        .map((parts) => (Array.isArray(parts) ? parts.filter(Boolean).join(' · ') : parts))
        .filter(Boolean)
        .filter((label, index, labels) => labels.indexOf(label) === index)
        .join(', ')
      return (
        <div className="mx-auto max-w-[18rem] text-center">
          {row.original.program ? (
            <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {programLabel(row.original.program)}
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
          {row.original.subjects.length > 0 ? (
            <p className="mt-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              {row.original.subjects.join(' · ')}
            </p>
          ) : null}
          {catalog ? (
            <p
              className="mt-0.5 line-clamp-2 text-[11px] text-slate-400"
              title={catalog}
            >
              {catalog}
            </p>
          ) : null}
        </div>
      )
    },
  },
  {
    id: 'approval',
    accessorFn: (row) => ALLOCATION_STAGE_LABEL[allocationStage(row)],
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" align="center" />
    ),
    cell: ({ row }) => {
      const stage = allocationStage(row.original)
      return (
        <div className="text-center">
          <AllocationStagePill stage={stage} />
          <p className="mt-1 text-[11px] text-slate-400">
            {ALLOCATION_STAGE_HINT[stage]}
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Added" align="center" />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDateTime(row.original.createdAt)}
      </p>
    ),
  },
  {
    id: 'branch',
    accessorFn: (row) => row.branchName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch" align="center" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.branchName ? (
          <span className="inline-flex rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink">
            {row.original.branchName}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </div>
    ),
  },
  {
    id: 'actions',
    enableSorting: false,
    size: 120,
    meta: { sticky: 'right' },
    header: () => (
      <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
        Action
      </span>
    ),
    cell: ({ row }) => (
      <TutorAllocationActionsCell allocation={row.original} />
    ),
  },
]
