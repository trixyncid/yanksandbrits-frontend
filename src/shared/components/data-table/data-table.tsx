import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import { useMemo, useState, type ReactNode } from 'react'

import { Card } from '../ui/card'
import { cn } from '../../lib/cn'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'

type DataTableColumnMeta = {
  sticky?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
}

export type DataTableSelectionContext<TData> = {
  selectedRows: TData[]
  selectedCount: number
  clearSelection: () => void
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
  toolbarActions?: ReactNode
  /** Renders above the title/search header row (e.g. list filters). */
  toolbarFilters?: ReactNode
  emptyMessage?: string
  /** Enables vertical scrolling with sticky headers. */
  maxHeight?: number | string
  enableRowSelection?: boolean
  getRowId?: (originalRow: TData, index: number) => string
  selectionToolbar?: (ctx: DataTableSelectionContext<TData>) => ReactNode
  className?: string
  variant?: 'default' | 'glass'
  /** `pill` matches Steadi-style capsule search inputs. */
  searchVariant?: 'default' | 'pill'
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50]
const CHECKBOX_CLASS =
  'size-4 rounded border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40'

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

function SelectionCheckbox({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  ariaLabel: string
}) {
  return (
    <input
      type="checkbox"
      className={CHECKBOX_CLASS}
      checked={checked}
      ref={(element) => {
        if (element) {
          element.indeterminate = Boolean(indeterminate)
        }
      }}
      onChange={onChange}
      onClick={(event) => event.stopPropagation()}
      aria-label={ariaLabel}
    />
  )
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
  toolbarFilters,
  emptyMessage = 'No data found',
  maxHeight = '65vh',
  enableRowSelection = false,
  getRowId,
  selectionToolbar,
  className,
  variant = 'default',
  searchVariant = 'default',
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
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

  const selectionColumn = useMemo<ColumnDef<TData, unknown> | null>(() => {
    if (!enableRowSelection) {
      return null
    }

    return {
      id: '__select',
      size: 48,
      enableSorting: false,
      header: ({ table }) => (
        <SelectionCheckbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          ariaLabel="Select all rows on this page"
        />
      ),
      cell: ({ row }) => (
        <SelectionCheckbox
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
          ariaLabel="Select row"
        />
      ),
    }
  }, [enableRowSelection])

  const tableColumns = useMemo(() => {
    if (!selectionColumn) {
      return columns
    }
    return [selectionColumn, ...columns]
  }, [columns, selectionColumn])

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    enableRowSelection,
    getRowId,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: coreRowModel,
    getSortedRowModel: sortedRowModel,
    getFilteredRowModel: filteredRowModel,
    getPaginationRowModel: paginationRowModel,
  })

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)
  const selectedCount = selectedRows.length

  function clearSelection() {
    setRowSelection({})
  }

  return (
    <Card
      className={cn(
        'overflow-hidden',
        variant === 'glass' &&
          'border-white/70 bg-white/70 shadow-[0_24px_48px_-28px_rgba(66,116,185,0.35)] backdrop-blur-xl',
        className,
      )}
    >
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
        filters={toolbarFilters}
        variant={variant}
        searchVariant={searchVariant}
      />

      {enableRowSelection && selectedCount > 0 && selectionToolbar
        ? selectionToolbar({
            selectedRows,
            selectedCount,
            clearSelection,
          })
        : null}

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
                  className={cn(
                    'group border-b border-slate-100 transition-colors hover:bg-[#F5F7FF]',
                    row.getIsSelected() && 'bg-[#F5F7FF]',
                  )}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | DataTableColumnMeta
                      | undefined

                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          'bg-white px-4 py-4 align-middle group-hover:bg-[#F5F7FF] sm:px-6',
                          row.getIsSelected() && 'bg-[#F5F7FF]',
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
                  colSpan={tableColumns.length}
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
        'inline-flex w-fit max-w-full whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-semibold',
        tone === 'info' && 'bg-[#E8EEFF] text-[#253CA1]',
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
