import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Trash2 } from 'lucide-react'

import {
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { notify } from '../../../shared/lib/notify'
import type { ClassroomListItem } from '../types/classroom'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export const classroomListColumns: ColumnDef<ClassroomListItem>[] = [
  {
    id: 'classroom',
    accessorFn: (row) => `${row.code} ${row.className}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Classroom" />
    ),
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {row.original.code}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{row.original.className}</p>
      </div>
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
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Date Created"
        align="center"
      />
    ),
    cell: ({ row }) => (
      <p className="text-center text-xs font-medium text-slate-600">
        {formatDateTime(row.original.createdAt)}
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
          aria-label={`View classroom ${row.original.code}`}
          onClick={() =>
            notify('info', {
              title: 'View classroom placeholder',
              description: `${row.original.className} detail page will be added later.`,
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
        >
          <Eye className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Delete classroom ${row.original.code}`}
          onClick={() =>
            notify('warning', {
              title: 'Delete classroom placeholder',
              description: `${row.original.className} delete confirmation will be added later.`,
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
