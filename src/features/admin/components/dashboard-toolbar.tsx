import { format, parseISO } from 'date-fns'
import { Building2, CalendarRange, LayoutDashboard } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import { DateRangePicker } from '../../../shared/components/ui/date-range-picker'
import { Select } from '../../../shared/components/ui/select'
import { cn } from '../../../shared/lib/cn'
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

function formatRangeLabel(start: string, end: string, compact = false) {
  const startDate = parseISO(start)
  const endDate = parseISO(end)
  if (compact) {
    return `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`
  }
  return `${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`
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
  const selectedBranchName =
    branchId === ALL_BRANCHES_ID
      ? 'All branches'
      : (branches.find((branch) => branch.id === branchId)?.name ??
        'Select a branch')
  const isAllBranches = branchId === ALL_BRANCHES_ID

  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-[1.5rem]',
        'border border-slate-200/70 bg-white',
        'shadow-[0_1px_0_rgba(15,23,42,0.03),0_12px_32px_-20px_rgba(37,60,161,0.18)]',
        'animate-in fade-in slide-in-from-top-1 duration-500',
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,60,161,0.08),transparent_55%),linear-gradient(180deg,#F8FAFF_0%,#FFFFFF_42%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-[#253CA1]/10 blur-3xl"
      />

      <div className="relative z-10 flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#253CA1] text-white shadow-sm shadow-[#253CA1]/25">
              <LayoutDashboard className="size-4" strokeWidth={2.25} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#253CA1]/80 uppercase">
                Operations
              </p>
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                isAllBranches
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-[#E8EEFF] text-[#1B2A5A]',
              )}
            >
              <Building2 className="size-3.5 shrink-0 opacity-70" />
              <span className="truncate">{selectedBranchName}</span>
            </span>

            {metrics ? (
              <>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80"
                  title={formatRangeLabel(
                    metrics.dateRange.start,
                    metrics.dateRange.end,
                  )}
                >
                  <CalendarRange className="size-3.5 shrink-0 text-[#253CA1]" />
                  <span className="truncate">
                    {formatRangeLabel(
                      metrics.dateRange.start,
                      metrics.dateRange.end,
                      true,
                    )}
                  </span>
                </span>
                <span className="hidden text-xs text-slate-400 sm:inline">
                  vs{' '}
                  {formatRangeLabel(
                    metrics.comparisonRange.start,
                    metrics.comparisonRange.end,
                    true,
                  )}
                </span>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Revenue, enrollment, pipeline, and delivery health.
              </p>
            )}
          </div>
        </div>

        <div
          className={cn(
            'flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-stretch',
            'rounded-2xl border border-slate-200/80 bg-white/80 p-2 shadow-sm shadow-slate-200/40 backdrop-blur-sm',
          )}
        >
          <label className="flex min-w-0 flex-1 flex-col gap-1 px-1 sm:min-w-[15rem]">
            <span className="px-1 text-[10px] font-semibold tracking-[0.1em] text-slate-400 uppercase">
              Period
            </span>
            <DateRangePicker
              value={dateRange}
              onChange={onDateRangeChange}
              placeholder="Select date range"
              className="w-full border-slate-200/80 bg-slate-50/80 hover:bg-white"
            />
          </label>

          <div
            aria-hidden
            className="hidden w-px self-stretch bg-slate-200/80 sm:block"
          />

          <label className="flex min-w-0 flex-1 flex-col gap-1 px-1 sm:w-52 sm:flex-none">
            <span className="px-1 text-[10px] font-semibold tracking-[0.1em] text-slate-400 uppercase">
              Branch
            </span>
            <Select
              value={branchId}
              aria-label="Select branch"
              disabled={branchesLoading || branches.length === 0}
              onChange={(event) => onBranchChange(event.target.value)}
              containerClassName="w-full"
              className="h-10 border-slate-200/80 bg-slate-50/80 hover:bg-white"
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
    </header>
  )
}
