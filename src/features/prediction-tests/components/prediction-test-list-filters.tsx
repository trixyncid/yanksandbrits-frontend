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
            'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
            activeCount > 0
              ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              : 'bg-canvas text-ink hover:bg-canvas-deep',
          )}
          aria-label={
            activeCount > 0 ? `Filters, ${activeCount} active` : 'Filters'
          }
        >
          <ListFilter className="size-4" aria-hidden />
          Filters
          {activeCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-semibold text-white">
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
          <div>
            <p className="text-sm font-bold text-ink">Filters</p>
            <p className="text-xs text-slate-500">Narrow the list of tests.</p>
          </div>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-8 items-center rounded-full bg-ink px-3 text-xs font-semibold text-white transition hover:bg-ink-soft"
            >
              Clear all
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

const activeControlClassName = 'border-brand-500/40 bg-brand-50'

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
