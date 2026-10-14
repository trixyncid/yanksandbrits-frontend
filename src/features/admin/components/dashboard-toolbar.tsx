import { useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import {
  Building2,
  CalendarRange,
  CreditCard,
  GitCompareArrows,
  Target,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'

import {
  HeroPillButton,
  HeroSpotlight,
  PageHero,
  type HeroStat,
} from '../../../shared/components/page'
import { DateRangePicker } from '../../../shared/components/ui/date-range-picker'
import { Select } from '../../../shared/components/ui/select'
import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import { Can } from '../../auth/components/can'
import type { DashboardMetrics } from '../types/dashboard'
import { ALL_BRANCHES_ID, DASHBOARD_ANCHORS } from '../types/dashboard'
import { DashboardChip } from './dashboard-kit'

type DashboardToolbarProps = {
  dateRange: DateRange | undefined
  branchId: string
  branches: { id: string; name: string }[]
  branchesLoading: boolean
  metrics?: DashboardMetrics
  onDateRangeChange: (range: DateRange | undefined) => void
  onBranchChange: (branchId: string) => void
}

function formatRangeLabel(start: string, end: string) {
  return `${format(parseISO(start), 'MMM d')} – ${format(parseISO(end), 'MMM d, yyyy')}`
}

function jumpTo(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function changeCaption(changePct: number | null | undefined) {
  if (changePct == null) return 'No earlier period to compare'
  if (changePct === 0) return 'Same as the previous period'
  return `${changePct > 0 ? 'Up' : 'Down'} ${Math.abs(changePct)}% on the previous period`
}

/**
 * Dashboard banner: title, period + branch filters, the four headline numbers
 * and a spotlight for payments waiting on approval.
 */
export function DashboardToolbar({
  dateRange,
  branchId,
  branches,
  branchesLoading,
  metrics,
  onDateRangeChange,
  onBranchChange,
}: DashboardToolbarProps) {
  const navigate = useNavigate()
  const isAllBranches = branchId === ALL_BRANCHES_ID
  const selectedBranchName = isAllBranches
    ? 'All branches'
    : (branches.find((branch) => branch.id === branchId)?.name ??
      'Select a branch')

  const kpis = metrics?.kpis
  const stats: HeroStat[] = [
    {
      id: 'revenue',
      label: 'Revenue',
      icon: TrendingUp,
      value: kpis ? (
        <span title={formatCurrencyAmount(kpis.revenue.current)}>
          {formatCurrencyCompact(kpis.revenue.current)}
        </span>
      ) : (
        '–'
      ),
      caption: kpis ? changeCaption(kpis.revenue.changePct) : undefined,
      hint: 'Jump to the revenue trend',
      onSelect: () => jumpTo(DASHBOARD_ANCHORS.money),
    },
    {
      id: 'enrollments',
      label: 'New enrollments',
      icon: UserPlus,
      value: kpis ? kpis.newEnrollments.current.toLocaleString('en-US') : '–',
      caption: kpis
        ? `${kpis.newEnrollments.previous.toLocaleString('en-US')} in the previous period`
        : undefined,
      hint: 'Jump to the enrollment trend',
      onSelect: () => jumpTo(DASHBOARD_ANCHORS.pipeline),
    },
    {
      id: 'active',
      label: 'Active students',
      icon: Users,
      value: kpis ? kpis.activeStudents.toLocaleString('en-US') : '–',
      caption: kpis
        ? metrics?.branchId == null
          ? 'Across all branches'
          : 'At this branch'
        : undefined,
      hint: 'Jump to teaching capacity',
      onSelect: () => jumpTo(DASHBOARD_ANCHORS.capacity),
    },
    {
      id: 'conversion',
      label: 'Conversion',
      icon: Target,
      value: kpis
        ? kpis.conversionRate == null
          ? '—'
          : `${kpis.conversionRate.toFixed(kpis.conversionRate % 1 === 0 ? 0 : 1)}%`
        : '–',
      caption: kpis ? 'New leads who went on to enroll' : undefined,
      hint: 'Jump to where leads come from',
      onSelect: () => jumpTo(DASHBOARD_ANCHORS.acquisition),
    },
  ]

  const pending = kpis?.pendingCollections

  return (
    <PageHero
      eyebrow="Overview"
      title="Dashboard"
      description="Money, students, classes and leads for the period and branch you pick."
      theme="sky"
      pattern="waves"
      actions={
        <div className="flex w-full flex-col gap-2 rounded-[1.5rem] bg-white/60 p-1.5 backdrop-blur-md sm:w-auto sm:flex-row sm:rounded-full">
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            placeholder="Pick a date range"
            className="h-10 w-full min-w-0 bg-white sm:w-auto sm:min-w-60"
          />
          <Select
            value={branchId}
            aria-label="Choose a branch"
            disabled={branchesLoading || branches.length === 0}
            onChange={(event) => onBranchChange(event.target.value)}
            containerClassName="w-full sm:w-52"
            className="h-10 rounded-full border-transparent bg-white"
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
        </div>
      }
      stats={stats}
      spotlight={
        pending ? (
          <Can module="studentPayments">
            <HeroSpotlight
              title={
                pending.count > 0
                  ? `${formatCurrencyCompact(pending.amount)} to approve`
                  : 'Payments are up to date'
              }
              description={
                pending.count > 0
                  ? `${pending.count} payment${pending.count === 1 ? '' : 's'} waiting for approval.`
                  : 'Nothing is waiting for approval right now.'
              }
              actions={
                <HeroPillButton
                  icon={CreditCard}
                  onClick={() => void navigate({ to: '/student-payments' })}
                >
                  {pending.count > 0 ? 'Review payments' : 'Open payments'}
                </HeroPillButton>
              }
            />
          </Can>
        ) : undefined
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <DashboardChip icon={Building2} className="bg-white/70 text-ink">
          {selectedBranchName}
        </DashboardChip>
        {metrics ? (
          <>
            <DashboardChip icon={CalendarRange} className="bg-white/70 text-ink">
              {formatRangeLabel(metrics.dateRange.start, metrics.dateRange.end)}
            </DashboardChip>
            <DashboardChip
              icon={GitCompareArrows}
              className="bg-white/40 text-slate-600"
            >
              Compared with{' '}
              {formatRangeLabel(
                metrics.comparisonRange.start,
                metrics.comparisonRange.end,
              )}
            </DashboardChip>
          </>
        ) : null}
      </div>
    </PageHero>
  )
}
