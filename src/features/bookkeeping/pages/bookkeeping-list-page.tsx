import { useNavigate } from '@tanstack/react-router'
import {
  CalendarRange,
  CircleCheck,
  Hourglass,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  ClearListFiltersButton,
  DataTable,
  ListFilterSelect,
  ListToolbarFilters,
} from '../../../shared/components/data-table'
import {
  HeroPillButton,
  HeroSpotlight,
  PageHero,
} from '../../../shared/components/page'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { cn } from '../../../shared/lib/cn'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import { updateOpenPeriodSalaries } from '../api/bookkeeping-api'
import { bookkeepingListColumns } from '../components/bookkeeping-list-columns'
import {
  BookkeepingListErrorState,
  BookkeepingListLoadingState,
} from '../components/bookkeeping-list-states'
import { useBookkeepingQuery } from '../hooks/use-bookkeeping-query'
import { formatPeriodDate } from '../lib/bookkeeping-status'
import type { BookkeepingListItem } from '../types/bookkeeping'

function filterBookkeeping(row: BookkeepingListItem, search: string) {
  const haystack = [row.startDate, row.endDate, row.status, row.createdBy]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'void', label: 'Void' },
]

export default function BookkeepingListPage() {
  const navigate = useNavigate()
  const query = useBookkeepingQuery()
  const [isUpdatingSalary, setIsUpdatingSalary] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  const allPeriods = useMemo(() => query.data?.data ?? [], [query.data?.data])
  const periods = useMemo(
    () =>
      statusFilter
        ? allPeriods.filter((period) => period.status === statusFilter)
        : allPeriods,
    [allPeriods, statusFilter],
  )
  const latestEnd = useMemo(
    () =>
      allPeriods
        .filter((period) => period.status !== 'void')
        .reduce<string>(
          (latest, period) =>
            period.endDate > latest ? period.endDate : latest,
          '',
        ),
    [allPeriods],
  )

  const loaded = query.isSuccess
  const stat = (count: number) => (loaded ? count : '–')
  const countBy = (status: BookkeepingListItem['status']) =>
    allPeriods.filter((period) => period.status === status).length

  async function handleUpdateSalary() {
    setIsUpdatingSalary(true)
    try {
      await updateOpenPeriodSalaries()
      await query.refetch()
      notify('success', {
        title: 'Salaries updated',
        description: 'Open-period salary calculations have been refreshed.',
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

  const listFilters = (
    <ListToolbarFilters>
      <ListFilterSelect
        label="Status"
        ariaLabel="Filter by period status"
        value={statusFilter}
        onChange={setStatusFilter}
        options={STATUS_FILTER_OPTIONS}
      />
      <ClearListFiltersButton
        visible={Boolean(statusFilter)}
        onClear={() => setStatusFilter('')}
        className="h-10 rounded-full border-transparent bg-ink text-white hover:bg-ink-soft hover:text-white"
      />
    </ListToolbarFilters>
  )

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <PageHero
          eyebrow="Money"
          title="Bookkeeping"
          description="Payroll periods for tutors and education counsellors. Approving a period builds everyone's salary for those dates."
          theme="dusk"
          pattern="waves"
          actions={
            <Can module="bookkeeping" action="change">
              <button
                type="button"
                disabled={isUpdatingSalary}
                onClick={() => void handleUpdateSalary()}
                title="Recalculate salaries for the open period (after the latest bookkeeping up to today)"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white/15 px-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={cn('size-4', isUpdatingSalary && 'animate-spin')}
                />
                {isUpdatingSalary ? 'Updating…' : 'Update open-period salary'}
              </button>
            </Can>
          }
          stats={[
            {
              id: 'all',
              label: 'Periods',
              value: stat(allPeriods.length),
              icon: CalendarRange,
              caption:
                loaded && latestEnd
                  ? `Latest ends ${formatPeriodDate(latestEnd)}`
                  : undefined,
              hint: 'Show all periods',
              active: !statusFilter,
              onSelect: () => setStatusFilter(''),
            },
            {
              id: 'pending',
              label: 'Pending',
              value: stat(countBy('pending')),
              icon: Hourglass,
              caption: 'Waiting to be approved',
              hint: 'Show pending periods',
              active: statusFilter === 'pending',
              onSelect: () => setStatusFilter('pending'),
            },
            {
              id: 'approved',
              label: 'Approved',
              value: stat(countBy('approved')),
              icon: CircleCheck,
              caption: 'Salaries calculated',
              hint: 'Show approved periods',
              active: statusFilter === 'approved',
              onSelect: () => setStatusFilter('approved'),
            },
          ]}
          spotlight={
            <Can module="bookkeeping" action="add">
              <HeroSpotlight
                title="Close a payroll period"
                description="Pick the dates, then approve it to calculate salaries."
                actions={
                  <HeroPillButton
                    icon={Plus}
                    onClick={() => void navigate({ to: '/bookkeeping/new' })}
                  >
                    Add period
                  </HeroPillButton>
                }
              />
            </Can>
          }
        />

        {query.isLoading ? <BookkeepingListLoadingState /> : null}
        {query.isError ? (
          <BookkeepingListErrorState onRetry={() => void query.refetch()} />
        ) : null}
        {query.isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="Payroll periods"
              description="Open a period to see tutor and education counsellor salaries."
              totalLabel="periods"
              columns={bookkeepingListColumns}
              data={periods}
              searchPlaceholder="Search by status, creator, dates..."
              searchVariant="pill"
              globalFilterFn={filterBookkeeping}
              initialPageSize={10}
              emptyMessage={
                statusFilter
                  ? 'No periods with this status'
                  : 'No bookkeeping periods yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
