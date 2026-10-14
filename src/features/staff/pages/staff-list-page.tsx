import { useNavigate } from '@tanstack/react-router'
import { CircleCheck, KeyRound, Plus, Users } from 'lucide-react'
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
import { staffListColumns } from '../components/staff-list-columns'
import {
  StaffListErrorState,
  StaffListLoadingState,
} from '../components/staff-list-states'
import { useStaffQuery } from '../hooks/use-staff-query'
import type { StaffListItem } from '../types/staff'

function filterUsers(row: StaffListItem, search: string) {
  const haystack = [
    row.pin,
    row.fullName,
    row.email,
    row.gender,
    row.roles.map((role) => role.name).join(' '),
    row.branch,
    row.isActive ? 'active' : 'inactive',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

type StaffListFilterState = {
  position: string
  status: string
}

const EMPTY_FILTERS: StaffListFilterState = { position: '', status: '' }

/** Fixed choices; the real roles found in the list are added between them. */
const BASE_ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Everyone' },
  { value: 'staff-only', label: 'Staff only' },
]
const NO_ROLE_FILTER = 'no-role'

function matchesRoleFilter(account: StaffListItem, filter: string) {
  if (!filter) return true
  if (filter === 'staff-only') return !account.isStudent
  if (filter === NO_ROLE_FILTER) return account.roles.length === 0 && !account.isSuperuser
  return account.roles.some((role) => role.code === filter)
}

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function StaffListPage() {
  const navigate = useNavigate()
  const staffQuery = useStaffQuery()
  const [filters, setFilters] = useSessionState<StaffListFilterState>(
    'list-filters:users',
    { ...EMPTY_FILTERS },
  )

  const allAccounts = useMemo(
    () => staffQuery.data?.data ?? [],
    [staffQuery.data?.data],
  )
  const hasActiveFilters = Boolean(filters.position || filters.status)

  const accounts = useMemo(
    () =>
      allAccounts.filter((account) => {
        if (!matchesRoleFilter(account, filters.position)) return false
        if (filters.status === 'active' && !account.isActive) return false
        if (filters.status === 'inactive' && account.isActive) return false
        return true
      }),
    [allAccounts, filters.position, filters.status],
  )

  const loaded = staffQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')
  // Role filter lists the real roles present, alphabetically.
  const roleFilterOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const account of allAccounts) {
      for (const role of account.roles) {
        if (role.code && !seen.has(role.code)) seen.set(role.code, role.name)
      }
    }
    return [
      ...BASE_ROLE_FILTER_OPTIONS,
      ...[...seen.entries()]
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, label]) => ({ value, label })),
      { value: NO_ROLE_FILTER, label: 'No role' },
    ]
  }, [allAccounts])
  const staffCount = allAccounts.filter((account) => !account.isStudent).length
  const neverSignedIn = allAccounts.filter(
    (account) => !account.isStudent && !account.lastLogin,
  ).length

  const listFilters = (
    <ListToolbarFilters>
      <ListFilterSelect
        label="Role"
        ariaLabel="Filter by role"
        value={filters.position}
        onChange={(position) =>
          setFilters((current) => ({ ...current, position }))
        }
        options={roleFilterOptions}
      />
      <ListFilterSelect
        label="Status"
        ariaLabel="Filter by status"
        value={filters.status}
        onChange={(status) => setFilters((current) => ({ ...current, status }))}
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
          title="Users"
          description="Everyone who can sign in to the admin: staff, tutors, counsellors and students. Open someone to see their details, schedule, leave and pay."
          theme="ink"
          pattern="dots"
          stats={[
            {
              id: 'all',
              label: 'Accounts',
              value: stat(allAccounts.length),
              icon: Users,
              caption: loaded ? `${stat(staffCount)} staff` : undefined,
              hint: 'Show every account',
              active: !hasActiveFilters,
              onSelect: () => setFilters({ ...EMPTY_FILTERS }),
            },
            {
              id: 'active-staff',
              label: 'Active staff',
              value: stat(
                allAccounts.filter(
                  (account) => !account.isStudent && account.isActive,
                ).length,
              ),
              icon: CircleCheck,
              hint: 'Show active staff only',
              active:
                filters.position === 'staff-only' && filters.status === 'active',
              onSelect: () =>
                setFilters({ position: 'staff-only', status: 'active' }),
            },
            {
              id: 'inactive',
              label: 'Inactive',
              value: stat(
                allAccounts.filter((account) => !account.isActive).length,
              ),
              icon: KeyRound,
              caption: loaded
                ? `${neverSignedIn} staff never signed in`
                : undefined,
              hint: 'Show inactive accounts',
              active: !filters.position && filters.status === 'inactive',
              onSelect: () => setFilters({ position: '', status: 'inactive' }),
            },
          ]}
          spotlight={
            <Can module="users" action="add">
              <HeroSpotlight
                title="Add a staff account"
                description="Give a new team member their own sign-in and role."
                actions={
                  <HeroPillButton
                    icon={Plus}
                    onClick={() => void navigate({ to: '/users/new' })}
                  >
                    Add staff account
                  </HeroPillButton>
                }
              />
            </Can>
          }
        />

        {staffQuery.isLoading ? <StaffListLoadingState /> : null}

        {staffQuery.isError ? (
          <StaffListErrorState onRetry={() => void staffQuery.refetch()} />
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="All accounts"
              description="Students open on their student profile; staff open on their account page."
              totalLabel="accounts"
              columns={staffListColumns}
              data={accounts}
              searchPlaceholder="Search by name, PIN, email or branch..."
              searchVariant="pill"
              globalFilterFn={filterUsers}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No accounts match these filters'
                  : 'No user accounts yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
