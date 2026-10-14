import {
  CalendarClock,
  GraduationCap,
  RefreshCw,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { DataTable } from '../../../shared/components/data-table'
import {
  HeroPillButton,
  HeroSpotlight,
  PageHero,
} from '../../../shared/components/page'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { cn } from '../../../shared/lib/cn'
import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { DuskPanel } from '../../student-payments/components/payment-ui'
import {
  BookkeepingPeriodSelect,
  OPEN_BOOKKEEPING_PERIOD,
  type BookkeepingPeriodValue,
} from '../../bookkeeping/components/bookkeeping-period-select'
import { useBookkeepingQuery } from '../../bookkeeping/hooks/use-bookkeeping-query'
import { refreshMarketingSalaries } from '../api/marketing-report-api'
import { marketingReportListColumns } from '../components/marketing-report-list-columns'
import {
  MarketingReportListErrorState,
  MarketingReportListLoadingState,
} from '../components/marketing-report-list-states'
import { useMarketingReportQuery } from '../hooks/use-marketing-report-query'
import type { MarketingReportListItem } from '../types/marketing-report'

function filterMarketingReport(row: MarketingReportListItem, search: string) {
  const haystack = [
    row.marketerPin,
    row.marketerName,
    row.email,
    row.branch,
    String(row.totalSalary),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function MarketingReportListPage() {
  const [period, setPeriod] = useState<BookkeepingPeriodValue>(
    OPEN_BOOKKEEPING_PERIOD,
  )
  const periodsQuery = useBookkeepingQuery()
  const query = useMarketingReportQuery({ bookkeepingId: period })
  const [isUpdatingSalary, setIsUpdatingSalary] = useState(false)

  const periods = useMemo(() => {
    const rows = periodsQuery.data?.data ?? []
    return [...rows].sort((a, b) => b.endDate.localeCompare(a.endDate))
  }, [periodsQuery.data?.data])

  const isOpenPeriod = period === OPEN_BOOKKEEPING_PERIOD

  async function handleUpdateSalary() {
    setIsUpdatingSalary(true)
    try {
      await refreshMarketingSalaries()
      await query.refetch()
      notify('success', {
        title: 'Salaries updated',
        description: 'Open-period education counsellor salaries have been recalculated.',
      })
    } catch (error) {
      notify('error', {
        title: 'Unable to update salaries',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsUpdatingSalary(false)
    }
  }

  const rows = query.data?.data ?? []
  const loaded = query.isSuccess
  const payroll = rows.reduce((sum, row) => sum + row.totalSalary, 0)
  const basePay = rows.reduce((sum, row) => sum + row.mainSalary, 0)
  const bonusPay = rows.reduce((sum, row) => sum + row.bonusSalary, 0)
  const students = rows.reduce((sum, row) => sum + row.totalStudent, 0)
  const topEarners = [...rows]
    .sort((a, b) => b.totalSalary - a.totalSalary)
    .slice(0, 3)
  const bonusShare =
    basePay + bonusPay > 0
      ? Math.round((bonusPay / (basePay + bonusPay)) * 100)
      : 0
  const show = (value: string | number) => (loaded ? value : '–')

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <PageHero
          eyebrow="Money"
          title="Education counsellor salaries"
          description="Base pay and bonus for each education counsellor in a payroll period."
          theme="dusk"
          pattern="dots"
          actions={
            <BookkeepingPeriodSelect
              variant="pill"
              value={period}
              periods={periods}
              disabled={periodsQuery.isLoading}
              onChange={setPeriod}
            />
          }
          stats={[
            {
              id: 'payroll',
              label: 'Total payroll',
              value: show(formatCurrencyCompact(payroll)),
              icon: Wallet,
              caption: loaded
                ? isOpenPeriod
                  ? 'Open period, so far'
                  : 'Closed period'
                : undefined,
            },
            {
              id: 'counsellors',
              label: 'Counsellors paid',
              value: show(rows.length),
              icon: Users,
              caption:
                loaded && rows.length > 0
                  ? `Avg ${formatCurrencyCompact(payroll / rows.length)}`
                  : undefined,
            },
            {
              id: 'students',
              label: 'Students',
              value: show(students),
              icon: GraduationCap,
              caption: 'Counted toward pay',
            },
          ]}
          spotlight={
            <HeroSpotlight
              title={isOpenPeriod ? 'Refresh the open period' : 'Closed period'}
              description={
                isOpenPeriod
                  ? 'Rebuild the salary preview from the latest bookkeeping up to today.'
                  : 'Salaries for a closed bookkeeping period are fixed. Switch to the open period to update.'
              }
              actions={
                isOpenPeriod ? (
                  <button
                    type="button"
                    disabled={isUpdatingSalary}
                    title="Refresh open-period salary preview"
                    onClick={() => void handleUpdateSalary()}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-sm transition hover:bg-ink hover:text-white disabled:cursor-wait disabled:opacity-70"
                  >
                    <RefreshCw
                      className={cn(
                        'size-4',
                        isUpdatingSalary && 'animate-spin',
                      )}
                    />
                    {isUpdatingSalary ? 'Updating…' : 'Update salary'}
                  </button>
                ) : (
                  <HeroPillButton
                    icon={CalendarClock}
                    onClick={() => setPeriod(OPEN_BOOKKEEPING_PERIOD)}
                  >
                    Go to open period
                  </HeroPillButton>
                )
              }
            />
          }
        />

        {loaded && rows.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <section className="rounded-[1.75rem] bg-white p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-canvas">
                  <Trophy className="size-4" />
                </span>
                Top earners this period
              </h2>
              <ol className="mt-4 space-y-2">
                {topEarners.map((row, index) => (
                  <li
                    key={row.id}
                    className="flex items-center gap-3 rounded-2xl bg-canvas px-3 py-2.5"
                  >
                    <span
                      className={cn(
                        'inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        index === 0
                          ? 'bg-ink text-white'
                          : 'bg-white text-ink',
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {row.marketerName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {row.totalStudent} student
                        {row.totalStudent === 1 ? '' : 's'}
                        {row.branch && row.branch !== '—'
                          ? ` · ${row.branch}`
                          : ''}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-ink tabular-nums">
                      {formatCurrencyAmount(row.totalSalary)}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <DuskPanel pattern="dots">
              <p className="text-[11px] font-bold tracking-[0.14em] text-white/70 uppercase">
                Bonus share
              </p>
              <p className="mt-1 text-4xl font-bold tracking-tight tabular-nums">
                {bonusShare}%
              </p>
              <p className="mt-1 text-xs text-white/75">
                of base and bonus pay came from bonuses.
              </p>
              <div
                className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-white/15"
                role="img"
                aria-label={`Base pay ${formatCurrencyAmount(basePay)}, bonus ${formatCurrencyAmount(bonusPay)}`}
              >
                <div
                  className="h-full bg-white"
                  style={{ width: `${100 - bonusShare}%` }}
                />
                <div
                  className="h-full bg-emerald-300"
                  style={{ width: `${bonusShare}%` }}
                />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="flex items-center gap-1.5 text-white/70">
                    <span className="size-2 rounded-full bg-white" /> Base pay
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums">
                    {formatCurrencyCompact(basePay)}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-white/70">
                    <span className="size-2 rounded-full bg-emerald-300" />{' '}
                    Bonus
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums">
                    {formatCurrencyCompact(bonusPay)}
                  </dd>
                </div>
              </dl>
            </DuskPanel>
          </div>
        ) : null}

        {query.isLoading || periodsQuery.isLoading ? (
          <MarketingReportListLoadingState />
        ) : null}
        {query.isError ? (
          <MarketingReportListErrorState
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="Counsellor pay"
              description={`Period: ${query.data.meta.period}`}
              totalLabel="counsellors"
              columns={marketingReportListColumns}
              data={query.data.data}
              searchPlaceholder="Search by name, branch..."
              searchVariant="pill"
              globalFilterFn={filterMarketingReport}
              initialPageSize={10}
              emptyMessage={
                isOpenPeriod
                  ? 'No education counsellor salary activity in the open period yet'
                  : 'No education counsellor salary data found for this bookkeeping period'
              }
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
