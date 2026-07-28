import type { ColumnDef, SortingState } from '@tanstack/react-table'

export type DataTablePaginationState = {
  pageIndex: number
  pageSize: number
}

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  sorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  pagination?: DataTablePaginationState
  onPaginationChange?: (pagination: DataTablePaginationState) => void
  pageSizeOptions?: number[]
  emptyMessage?: string
  toolbarActions?: React.ReactNode
  title?: string
  description?: string
  totalLabel?: string
}
