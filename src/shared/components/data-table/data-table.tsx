import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState } from 'react'

import { Card } from '../ui/card'
import { cn } from '../../lib/cn'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'

type DataTableColumnMeta = {
  sticky?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  title?: string
  description?: string
  totalLabel?: string
  searchPlaceholder?: string
  globalFilterFn?: (row: TData, search: string) => boolean
  pageSizeOptions?: number[]
  initialPageSize?: number
  toolbarActions?: React.ReactNode
  emptyMessage?: string
  /** Enables vertical scrolling with sticky headers. */
  maxHeight?: number | string
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50]

const coreRowModel = getCoreRowModel()
const sortedRowModel = getSortedRowModel()
const filteredRowModel = getFilteredRowModel()
const paginationRowModel = getPaginationRowModel()

function getStickyClassName(
  sticky: DataTableColumnMeta['sticky'] | undefined,
  variant: 'header' | 'cell',
) {
  if (!sticky) {
    return variant === 'header' ? 'sticky top-0 z-20' : ''
  }

  if (sticky === 'right') {
    return variant === 'header'
      ? 'sticky top-0 right-0 z-30 shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.35)]'
      : 'sticky right-0 z-10 shadow-[-8px_0_12px_-10px_rgba(15,23,42,0.25)]'
  }

  return variant === 'header'
    ? 'sticky top-0 left-0 z-30 shadow-[8px_0_12px_-10px_rgba(15,23,42,0.35)]'
    : 'sticky left-0 z-10 shadow-[8px_0_12px_-10px_rgba(15,23,42,0.25)]'
}

export function DataTable<TData>({
  columns,
  data,
  title,
  description,
  totalLabel = 'data',
  searchPlaceholder = 'Search...',
  globalFilterFn,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  initialPageSize = 10,
  toolbarActions,
  emptyMessage = 'No data found',
  maxHeight = '65vh',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return data
    }

    if (globalFilterFn) {
      return data.filter((row) => globalFilterFn(row, query))
    }

    return data.filter((row) =>
      Object.values(row as Record<string, unknown>).some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(query),
      ),
    )
  }, [data, globalFilterFn, search])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: coreRowModel,
    getSortedRowModel: sortedRowModel,
    getFilteredRowModel: filteredRowModel,
    getPaginationRowModel: paginationRowModel,
  })

  return (
    <Card className="overflow-hidden">
      <DataTableToolbar
        title={title}
        description={description}
        totalCount={filteredData.length}
        totalLabel={totalLabel}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPagination((current) => ({ ...current, pageIndex: 0 }))
        }}
        searchPlaceholder={searchPlaceholder}
        actions={toolbarActions}
      />

      <div className="overflow-auto overscroll-contain" style={{ maxHeight }}>
        <table className="min-w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | DataTableColumnMeta
                    | undefined

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'bg-[#F8FAFC] px-4 py-3 text-left sm:px-6',
                        getStickyClassName(meta?.sticky, 'header'),
                      )}
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined,
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="group border-b border-slate-100 transition-colors hover:bg-[#F8FBFF]"
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | DataTableColumnMeta
                      | undefined

                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          'bg-white px-4 py-4 align-middle group-hover:bg-[#F8FBFF] sm:px-6',
                          getStickyClassName(meta?.sticky, 'cell'),
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
    </Card>
  )
}

export function DataTableBadge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'info' | 'success' | 'danger' | 'neutral' | 'primary' | 'warning'
}) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-1 text-[11px] font-semibold',
        tone === 'info' && 'bg-[#EDF4FF] text-[#2F5A94]',
        tone === 'primary' && 'bg-[#FFE8F0] text-[#9D174D]',
        tone === 'success' && 'bg-emerald-50 text-emerald-700',
        tone === 'danger' && 'bg-rose-50 text-rose-700',
        tone === 'warning' && 'bg-amber-50 text-amber-700',
        tone === 'neutral' && 'bg-slate-100 text-slate-600',
      )}
    >
      {children}
    </span>
  )
}
