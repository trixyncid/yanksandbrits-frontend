import {
  CalendarClock,
  Clock3,
  RefreshCw,
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
import { formatCurrencyCompact } from '../../../shared/lib/currency'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { PayMixBar } from '../../student-payments/components/payment-ui'
import {
  BookkeepingPeriodSelect,
  OPEN_BOOKKEEPING_PERIOD,
  type BookkeepingPeriodValue,
} from '../../bookkeeping/components/bookkeeping-period-select'
import { useBookkeepingQuery } from '../../bookkeeping/hooks/use-bookkeeping-query'
import { refreshTutorSalaries } from '../api/tutor-report-api'
import { tutorReportListColumns } from '../components/tutor-report-list-columns'
import {
  TutorReportListErrorState,
  TutorReportListLoadingState,
} from '../components/tutor-report-list-states'
import { useTutorReportQuery } from '../hooks/use-tutor-report-query'
import type { TutorReportListItem } from '../types/tutor-report'

function filterTutorReport(row: TutorReportListItem, search: string) {
  const haystack = [
    row.tutorPin,
    row.tutorName,
    row.tutorEmail,
    String(row.totalSalary),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function TutorReportListPage() {
  const [period, setPeriod] = useState<BookkeepingPeriodValue>(
    OPEN_BOOKKEEPING_PERIOD,
  )
  const periodsQuery = useBookkeepingQuery()
  const query = useTutorReportQuery({ bookkeepingId: period })
  const [isUpdatingSalary, setIsUpdatingSalary] = useState(false)

  const periods = useMemo(() => {
    const rows = periodsQuery.data?.data ?? []
    return [...rows].sort((a, b) => b.endDate.localeCompare(a.endDate))
  }, [periodsQuery.data?.data])

  const isOpenPeriod = period === OPEN_BOOKKEEPING_PERIOD

  async function handleUpdateSalary() {
    setIsUpdatingSalary(true)
    try {
      await refreshTutorSalaries()
      await query.refetch()
      notify('success', {
        title: 'Salaries updated',
        description: 'Open-period tutor salaries have been recalculated.',
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
  const sum = (pick: (row: TutorReportListItem) => number) =>
    rows.reduce((total, row) => total + pick(row), 0)
  const payroll = sum((row) => row.totalSalary)
  const sessions = sum((row) => row.sessions)
  const overtime = sum((row) => row.overtimeSessions)
  const show = (value: string | number) => (loaded ? value : '–')

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <PageHero
          eyebrow="Money"
          title="Tutor salaries"
          description="What each tutor earns for a payroll period: base pay, sessions, overtime and bonus."
          theme="dusk"
          pattern="arcs"
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
              id: 'tutors',
              label: 'Tutors paid',
              value: show(rows.length),
              icon: Users,
              caption:
                loaded && rows.length > 0
                  ? `Avg ${formatCurrencyCompact(payroll / rows.length)}`
                  : undefined,
            },
            {
              id: 'sessions',
              label: 'Sessions',
              value: show(sessions),
              icon: Clock3,
              caption: loaded ? `${overtime} overtime` : undefined,
            },
          ]}
          spotlight={
            <HeroSpotlight
              title={isOpenPeriod ? 'Refresh the open period' : 'Closed period'}
              description={
                isOpenPeriod
                  ? 'Recalculate session rates from the latest bookkeeping up to today.'
                  : 'Salaries for a closed bookkeeping period are fixed. Switch to the open period to update.'
              }
              actions={
                isOpenPeriod ? (
                  <button
                    type="button"
                    disabled={isUpdatingSalary}
                    title="Recalculate session rates for the open period"
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
        >
          {loaded && rows.length > 0 ? (
            <PayMixBar
              label="Where the money goes"
              formatAmount={formatCurrencyCompact}
              segments={[
                {
                  label: 'Base pay',
                  amount: sum((row) => row.mainSalary),
                  color: 'bg-white',
                },
                {
                  label: 'Sessions',
                  amount: sum((row) => row.sessionSalary),
                  color: 'bg-brand-300',
                },
                {
                  label: 'Overtime',
                  amount: sum((row) => row.overtimeSalary),
                  color: 'bg-amber-300',
                },
                {
                  label: 'Bonus',
                  amount: sum((row) => row.bonusSalary),
                  color: 'bg-emerald-300',
                },
              ]}
            />
          ) : null}
        </PageHero>

        {query.isLoading || periodsQuery.isLoading ? (
          <TutorReportListLoadingState />
        ) : null}
        {query.isError ? (
          <TutorReportListErrorState onRetry={() => void query.refetch()} />
        ) : null}
        {query.isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="Tutor pay"
              description={`Period: ${query.data.meta.period}`}
              totalLabel="tutors"
              columns={tutorReportListColumns}
              data={query.data.data}
              searchPlaceholder="Search by tutor, email..."
              searchVariant="pill"
              globalFilterFn={filterTutorReport}
              initialPageSize={10}
              emptyMessage={
                isOpenPeriod
                  ? 'No tutor salary activity in the open period yet'
                  : 'No tutor salary data found for this bookkeeping period'
              }
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
