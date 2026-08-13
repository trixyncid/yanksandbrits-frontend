import { format, parseISO } from 'date-fns'
import { Building2, CalendarRange } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { DateRangePicker } from '../../../shared/components/ui/date-range-picker'
import { Select } from '../../../shared/components/ui/select'
import type { DashboardMetrics } from '../types/dashboard'
import { ALL_BRANCHES_ID } from '../types/dashboard'

type DashboardToolbarProps = {
  dateRange: DateRange | undefined
  branchId: string
  branches: { id: string; name: string }[]
  branchesLoading: boolean
  metrics?: DashboardMetrics
  onDateRangeChange: (range: DateRange | undefined) => void
  onBranchChange: (branchId: string) => void
}

export function DashboardToolbar({
  dateRange,
  branchId,
  branches,
  branchesLoading,
  metrics,
  onDateRangeChange,
  onBranchChange,
}: DashboardToolbarProps) {
  const selectedBranch =
    branchId === ALL_BRANCHES_ID
      ? { id: ALL_BRANCHES_ID, name: 'All branches' }
      : branches.find((branch) => branch.id === branchId)

  return (
    <div className="flex flex-col gap-5 border-b border-slate-200/70 pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#4274B9] uppercase">
          Overview
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.85rem]">
          {selectedBranch?.name ?? 'Select a branch'}
        </h1>
        {metrics ? (
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <CalendarRange className="size-4 shrink-0 text-[#4274B9]" />
            <span>
              {format(parseISO(metrics.dateRange.start), 'MMM d, yyyy')} –{' '}
              {format(parseISO(metrics.dateRange.end), 'MMM d, yyyy')}
            </span>
            <span className="hidden text-slate-300 sm:inline">·</span>
            <span className="text-xs text-slate-400 sm:text-sm">
              vs{' '}
              {format(parseISO(metrics.comparisonRange.start), 'MMM d')} –{' '}
              {format(parseISO(metrics.comparisonRange.end), 'MMM d, yyyy')}
            </span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Revenue, enrollment, pipeline, and delivery health.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase">
            <CalendarRange className="size-3.5 text-[#4274B9]" />
            Date range
          </span>
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            placeholder="Select date range"
            className="w-full min-w-[16rem] sm:w-auto"
          />
        </label>

        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase">
            <Building2 className="size-3.5 text-[#4274B9]" />
            Branch
          </span>
          <Select
            value={branchId}
            aria-label="Select branch"
            disabled={branchesLoading || branches.length === 0}
            onChange={(event) => onBranchChange(event.target.value)}
            containerClassName="w-full min-w-[12rem] sm:w-56"
          >
            {branches.length === 0 ? (
              <option value="">Loading branches…</option>
            ) : (
              <>
                <option value={ALL_BRANCHES_ID}>All branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </>
            )}
          </Select>
        </label>
      </div>
    </div>
  )
}
