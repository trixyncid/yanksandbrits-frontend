import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2, Clock3, ClipboardList, Plus } from 'lucide-react'
import { useMemo } from 'react'

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
import { useSessionState } from '../../../shared/hooks/use-session-state'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import { paidLeaveListColumns } from '../components/paid-leave-list-columns'
import {
  PaidLeaveListErrorState,
  PaidLeaveListLoadingState,
} from '../components/paid-leave-list-states'
import { PaidLeaveOverview } from '../components/paid-leave-overview'
import { usePaidLeavesQuery } from '../hooks/use-paid-leaves-query'
import type { PaidLeaveListItem } from '../types/paid-leave'

function filterPaidLeave(row: PaidLeaveListItem, search: string) {
  const haystack = [
    row.staffPin,
    row.staffName,
    row.staffEmail,
    row.branch,
    row.notes,
    row.status,
    String(row.totalDays),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

type PaidLeaveFilterState = {
  status: string
}

const EMPTY_FILTERS: PaidLeaveFilterState = { status: '' }

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'void', label: 'Void' },
]

export default function PaidLeaveListPage() {
  const navigate = useNavigate()
  const leavesQuery = usePaidLeavesQuery()
  const [filters, setFilters] = useSessionState<PaidLeaveFilterState>(
    'list-filters:paid-leaves',
    { ...EMPTY_FILTERS },
  )

  const allLeaves = useMemo(
    () => leavesQuery.data?.data ?? [],
    [leavesQuery.data?.data],
  )
  const hasActiveFilters = Boolean(filters.status)
  const leaves = useMemo(
    () =>
      filters.status
        ? allLeaves.filter((leave) => leave.status === filters.status)
        : allLeaves,
    [allLeaves, filters.status],
  )

  const loaded = leavesQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')
  const approved = allLeaves.filter((leave) => leave.status === 'approved')
  const approvedDays = approved.reduce((sum, leave) => sum + leave.totalDays, 0)

  function openCreate() {
    void navigate({
      to: '/paid-leaves/new',
      search: { userId: undefined },
    })
  }

  const listFilters = (
    <ListToolbarFilters>
      <ListFilterSelect
        label="Status"
        ariaLabel="Filter by status"
        value={filters.status}
        onChange={(status) => setFilters({ status })}
        options={STATUS_FILTER_OPTIONS}
      />
      <ClearListFiltersButton
        visible={hasActiveFilters}
        onClear={() => setFilters({ ...EMPTY_FILTERS })}
        className="h-10 rounded-full border-transparent bg-ink text-white hover:bg-ink-soft hover:text-white"
      />
    </ListToolbarFilters>
  )

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <PageHero
          eyebrow="People"
          title="Paid Leave"
          description="Days off for staff and tutors. Record a request, approve it, and the person's balance updates on their profile."
          theme="mist"
          pattern="waves"
          stats={[
            {
              id: 'all',
              label: 'Requests',
              value: stat(allLeaves.length),
              icon: ClipboardList,
              hint: 'Show every request',
              active: !filters.status,
              onSelect: () => setFilters({ ...EMPTY_FILTERS }),
            },
            {
              id: 'pending',
              label: 'Waiting',
              value: stat(
                allLeaves.filter((leave) => leave.status === 'pending').length,
              ),
              icon: Clock3,
              caption: 'Need a decision',
              hint: 'Show pending requests',
              active: filters.status === 'pending',
              onSelect: () => setFilters({ status: 'pending' }),
            },
            {
              id: 'approved',
              label: 'Approved',
              value: stat(approved.length),
              icon: CheckCircle2,
              caption: loaded
                ? `${approvedDays} day${approvedDays === 1 ? '' : 's'} off in total`
                : undefined,
              hint: 'Show approved requests',
              active: filters.status === 'approved',
              onSelect: () => setFilters({ status: 'approved' }),
            },
          ]}
          spotlight={
            <Can module="paidLeaves" action="add">
              <HeroSpotlight
                title="Record paid leave"
                description="Pick the person and dates; attach a PDF if you have one."
                actions={
                  <HeroPillButton icon={Plus} onClick={openCreate}>
                    Record leave
                  </HeroPillButton>
                }
              />
            </Can>
          }
        />

        {leavesQuery.isLoading ? <PaidLeaveListLoadingState /> : null}

        {leavesQuery.isError ? (
          <PaidLeaveListErrorState
            onRetry={() => void leavesQuery.refetch()}
          />
        ) : null}

        {loaded ? (
          <div className="space-y-3">
            <PaidLeaveOverview leaves={allLeaves} />

            <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both [animation-delay:220ms]">
              <DataTable
                variant="soft"
                title="Leave requests"
                description="Open a request to approve it, change dates or attach a file."
                totalLabel="requests"
                columns={paidLeaveListColumns}
                data={leaves}
                searchPlaceholder="Search by name, PIN, branch or note..."
                searchVariant="pill"
                globalFilterFn={filterPaidLeave}
                initialPageSize={10}
                emptyMessage={
                  hasActiveFilters
                    ? 'No requests with this status'
                    : 'No paid leave recorded yet'
                }
                toolbarFilters={listFilters}
              />
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
