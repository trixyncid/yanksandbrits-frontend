import type { ColumnDef } from '@tanstack/react-table'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import type { ProgramListItem } from '../types/program'
import { ProgramActionsCell } from './program-actions-cell'

export const programListColumns: ColumnDef<ProgramListItem>[] = [
  {
    id: 'programCode',
    accessorFn: (row) => `${row.code} ${row.title}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Program Code" />
    ),
    cell: ({ row }) => (
      <div
        className="inline-flex min-w-40 flex-col rounded-lg px-3 py-2"
        style={{
          backgroundColor: row.original.backgroundColor,
          color: row.original.textColor,
        }}
      >
        <span className="text-sm font-bold">{row.original.code}</span>
        <span className="text-xs opacity-90">{row.original.title}</span>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Description"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="mx-auto max-w-72 text-center text-xs text-slate-500">
        {row.original.description || '-'}
      </p>
    ),
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Active Status"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <DataTableBadge tone={row.original.isActive ? 'success' : 'danger'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </DataTableBadge>
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
    cell: ({ row }) => <ProgramActionsCell program={row.original} />,
  },
]
