import { useNavigate } from '@tanstack/react-router'
import { BadgeDollarSign, Building2, Plus, UsersRound } from 'lucide-react'
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
import { marketingListColumns } from '../components/marketing-list-columns'
import {
  MarketingListErrorState,
  MarketingListLoadingState,
} from '../components/marketing-list-states'
import { useMarketingsQuery } from '../hooks/use-marketings-query'
import type { MarketingListItem } from '../types/marketing'

function filterMarketing(row: MarketingListItem, search: string) {
  const haystack = [
    row.pin,
    row.fullName,
    row.email,
    row.phone,
    row.gender,
    row.branch,
    ...row.roles.map((role) => role.name),
    row.isActive ? 'active' : 'inactive',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

type MarketingListFilterState = {
  status: string
  salary: string
}

const EMPTY_FILTERS: MarketingListFilterState = { status: '', salary: '' }

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const SALARY_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'set', label: 'Set' },
  { value: 'missing', label: 'Not set yet' },
]

function isManager(row: MarketingListItem) {
  return row.roles.some(
    (role) => role.code === 'branch-manager' || role.code === 'manager',
  )
}

export default function MarketingListPage() {
  const navigate = useNavigate()
  const marketingsQuery = useMarketingsQuery()
  const [filters, setFilters] = useSessionState<MarketingListFilterState>(
    'list-filters:marketings',
    { ...EMPTY_FILTERS },
  )

  const allCounsellors = useMemo(
    () => marketingsQuery.data?.data ?? [],
    [marketingsQuery.data?.data],
  )
  const hasActiveFilters = Boolean(filters.status || filters.salary)

  const counsellors = useMemo(
    () =>
      allCounsellors.filter((row) => {
        if (filters.status === 'active' && !row.isActive) return false
        if (filters.status === 'inactive' && row.isActive) return false
        if (filters.salary === 'set' && !row.hasSalary) return false
        if (filters.salary === 'missing' && row.hasSalary) return false
        return true
      }),
    [allCounsellors, filters.status, filters.salary],
  )

  const loaded = marketingsQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')
  const branchCount = new Set(
    allCounsellors.map((row) => row.branch).filter((branch) => branch !== '—'),
  ).size

  const listFilters = (
    <ListToolbarFilters>
      <ListFilterSelect
        label="Status"
        ariaLabel="Filter by status"
        value={filters.status}
        onChange={(status) => setFilters((current) => ({ ...current, status }))}
        options={STATUS_FILTER_OPTIONS}
      />
      <ListFilterSelect
        label="Base salary"
        ariaLabel="Filter by base salary"
        value={filters.salary}
        onChange={(salary) => setFilters((current) => ({ ...current, salary }))}
        options={SALARY_FILTER_OPTIONS}
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
          title="Education Counsellors"
          description="The people who look after leads and enrolments, plus branch managers. Their pay, commission and bonus tiers live on each profile."
          theme="dawn"
          pattern="waves"
          stats={[
            {
              id: 'all',
              label: 'Counsellors',
              value: stat(allCounsellors.length),
              icon: UsersRound,
              caption: loaded
                ? `${allCounsellors.filter(isManager).length} branch managers`
                : undefined,
              hint: 'Show everyone',
              active: !hasActiveFilters,
              onSelect: () => setFilters({ ...EMPTY_FILTERS }),
            },
            {
              id: 'no-salary',
              label: 'No base salary',
              value: stat(allCounsellors.filter((row) => !row.hasSalary).length),
              icon: BadgeDollarSign,
              caption: 'Set it before the next payroll',
              hint: 'Show counsellors without a base salary',
              active: filters.salary === 'missing' && !filters.status,
              onSelect: () => setFilters({ status: '', salary: 'missing' }),
            },
            {
              id: 'branches',
              label: 'Branches covered',
              value: loaded ? branchCount : '–',
              icon: Building2,
            },
          ]}
          spotlight={
            <Can module="users" action="add">
              <HeroSpotlight
                title="Add a counsellor"
                description="Their initials become the stamp on commission reports."
                actions={
                  <HeroPillButton
                    icon={Plus}
                    onClick={() => void navigate({ to: '/marketings/new' })}
                  >
                    Add counsellor
                  </HeroPillButton>
                }
              />
            </Can>
          }
        />

        {marketingsQuery.isLoading ? <MarketingListLoadingState /> : null}

        {marketingsQuery.isError ? (
          <MarketingListErrorState
            onRetry={() => void marketingsQuery.refetch()}
          />
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="Counsellor list"
              description="Open someone to manage their commission and bonus tiers, or set base salary from the row."
              totalLabel="counsellors"
              columns={marketingListColumns}
              data={counsellors}
              searchPlaceholder="Search by name, PIN, email or branch..."
              searchVariant="pill"
              globalFilterFn={filterMarketing}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No counsellors match these filters'
                  : 'No education counsellors yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
