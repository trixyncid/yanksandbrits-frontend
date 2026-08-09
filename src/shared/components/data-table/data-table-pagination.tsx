import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import type { Table } from '@tanstack/react-table'

import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { cn } from '../../lib/cn'

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50]

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  pageSizeOptions?: number[]
}

function getVisiblePages(current: number, total: number) {
  const pages: number[] = []

  for (let page = 1; page <= total; page += 1) {
    if (page === 1 || page === total || Math.abs(page - current) <= 2) {
      pages.push(page)
    }
  }

  return pages
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: DataTablePaginationProps<TData>) {
  const pageCount = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1
  const visiblePages = getVisiblePages(currentPage, Math.max(pageCount, 1))

  return (
    <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-slate-500">
        Page{' '}
        <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
        <span className="font-semibold text-slate-800">
          {Math.max(pageCount, 1)}
        </span>
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label
            htmlFor="page-size"
            className="text-xs font-semibold tracking-[0.08em] text-slate-400 uppercase"
          >
            Rows
          </label>
          <Select
            id="page-size"
            containerClassName="min-w-24 w-auto"
            className="min-w-24"
            value={String(table.getState().pagination.pageSize)}
            onChange={(event) => {
              table.setPageSize(Number(event.target.value))
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            className="px-2"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="First page"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="px-2"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {visiblePages.map((page, index) => {
            const previous = visiblePages[index - 1]
            const showEllipsis = previous !== undefined && page - previous > 1

            return (
              <div key={page} className="flex items-center gap-1">
                {showEllipsis ? (
                  <span className="px-1 text-xs text-slate-400">...</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => table.setPageIndex(page - 1)}
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-lg text-sm font-semibold transition',
                    page === currentPage
                      ? 'bg-[#4274B9] text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-[#BED2F2] hover:bg-[#F8FBFF]',
                  )}
                >
                  {page}
                </button>
              </div>
            )
          })}

          <Button
            variant="secondary"
            size="sm"
            className="px-2"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="px-2"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
