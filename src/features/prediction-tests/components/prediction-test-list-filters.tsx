import { ListFilter } from 'lucide-react'
import { useId, useMemo, type ReactNode } from 'react'

import { Label } from '../../../shared/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../shared/components/ui/popover'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { cn } from '../../../shared/lib/cn'
import { useMarketingOptionsQuery } from '../../users/hooks/use-user-options'
import type { PredictionTestListFilters } from '../api/prediction-test-query-keys'

type StatusFilter = NonNullable<PredictionTestListFilters['status']>

type PredictionTestListFiltersProps = {
  status: StatusFilter
  counsellorId: string
  hidePayment: boolean
  hideCounsellor: boolean
  onStatusChange: (status: StatusFilter) => void
  onCounsellorChange: (counsellorId: string) => void
  onClear: () => void
}

function isNestedPopoverTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest('[data-slot="popover-content"]'))
  )
}

export function PredictionTestListFiltersMenu({
  status,
  counsellorId,
  hidePayment,
  hideCounsellor,
  onStatusChange,
  onCounsellorChange,
  onClear,
}: PredictionTestListFiltersProps) {
  const fieldId = useId()
  const counsellorsQuery = useMarketingOptionsQuery()
  const counsellorOptions = useMemo(
    () => [
      { value: '', label: 'All counsellors' },
      ...(counsellorsQuery.data ?? []).map((option) => ({
        value: option.id,
        label: option.pin
          ? `${option.pin} · ${option.fullName}`
          : option.fullName,
        keywords: `${option.pin} ${option.fullName} ${option.email}`,
      })),
    ],
    [counsellorsQuery.data],
  )
  const paymentActive = !hidePayment && status !== 'all'
  const counsellorActive = !hideCounsellor && Boolean(counsellorId)
  const activeCount = [paymentActive, counsellorActive].filter(Boolean).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-full border bg-white px-3.5 text-sm font-medium shadow-sm transition-colors',
            'hover:border-slate-300',
            'focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#253CA1]/20',
            activeCount > 0
              ? 'border-[#253CA1]/40 bg-[#F5F7FF] text-[#253CA1]'
              : 'border-slate-200/80 text-slate-800',
          )}
          aria-label={
            activeCount > 0 ? `Filters, ${activeCount} active` : 'Filters'
          }
        >
          <ListFilter className="size-4" aria-hidden />
          Filters
          {activeCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#253CA1] px-1.5 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="w-[min(22rem,calc(100vw-2rem))]"
        onInteractOutside={(event) => {
          if (isNestedPopoverTarget(event.target)) {
            event.preventDefault()
          }
        }}
        onFocusOutside={(event) => {
          if (isNestedPopoverTarget(event.target)) {
            event.preventDefault()
          }
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Filters</p>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-medium text-[#253CA1] hover:text-[#1f3190]"
            >
              Clear
            </button>
          ) : null}
        </div>
        <div className="space-y-3 px-4 py-3">
          {hidePayment ? null : (
            <FilterField
              id={`${fieldId}-payment`}
              label="Payment status"
            >
              <Select
                id={`${fieldId}-payment`}
                value={status}
                onChange={(event) =>
                  onStatusChange(event.target.value as StatusFilter)
                }
                containerClassName="w-full sm:w-full"
                className={cn('h-10', paymentActive && activeControlClassName)}
                aria-label="Filter by payment status"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="void">Void</option>
              </Select>
            </FilterField>
          )}
          {hideCounsellor ? null : (
            <FilterField id={`${fieldId}-counsellor`} label="Counsellor">
              <SearchableSelect
                id={`${fieldId}-counsellor`}
                ariaLabel="Filter by counsellor"
                value={counsellorId}
                onChange={onCounsellorChange}
                options={counsellorOptions}
                disabled={counsellorsQuery.isLoading}
                placeholder="All counsellors"
                searchPlaceholder="Search by name or PIN"
                emptyMessage="No counsellors found"
                className={cn(
                  'h-10',
                  counsellorActive && activeControlClassName,
                )}
              />
            </FilterField>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const activeControlClassName = 'border-[#253CA1]/40 bg-[#F5F7FF]'

function FilterField({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-slate-500">
        {label}
      </Label>
      {children}
    </div>
  )
}
