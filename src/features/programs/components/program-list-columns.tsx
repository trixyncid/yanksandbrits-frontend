import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Trash2 } from 'lucide-react'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { notify } from '../../../shared/lib/notify'
import type { ProgramListItem } from '../types/program'

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
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label={`View program ${row.original.code}`}
          onClick={() =>
            notify('info', {
              title: 'View program placeholder',
              description: `${row.original.title} detail page will be added later.`,
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
        >
          <Eye className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Delete program ${row.original.code}`}
          onClick={() =>
            notify('warning', {
              title: 'Delete program placeholder',
              description: `${row.original.title} delete confirmation will be added later.`,
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    ),
  },
]
