import { useNavigate } from '@tanstack/react-router'
import { Eye, Lock, Plus, ShieldCheck } from 'lucide-react'
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
import { staffPermissionListColumns } from '../components/staff-permission-list-columns'
import {
  StaffPermissionListErrorState,
  StaffPermissionListLoadingState,
} from '../components/staff-permission-list-states'
import { useStaffPermissionsQuery } from '../hooks/use-staff-permissions-query'
import type { StaffPermissionListItem } from '../types/staff-permission'

function filterStaffPermission(row: StaffPermissionListItem, search: string) {
  const haystack = [
    row.name,
    row.code,
    row.description,
    String(row.permissionCount),
    String(row.memberCount),
    row.isSystem ? 'system' : '',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

type RoleListFilterState = {
  kind: string
  scope: string
}

const EMPTY_FILTERS: RoleListFilterState = { kind: '', scope: '' }

const KIND_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'system', label: 'Built-in' },
  { value: 'custom', label: 'Custom' },
]

const SCOPE_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'all', label: 'All records' },
  { value: 'own', label: 'Their own only' },
]

export default function StaffPermissionListPage() {
  const navigate = useNavigate()
  const permissionsQuery = useStaffPermissionsQuery()
  const [filters, setFilters] = useSessionState<RoleListFilterState>(
    'list-filters:roles',
    { ...EMPTY_FILTERS },
  )

  const allRoles = useMemo(
    () => permissionsQuery.data?.data ?? [],
    [permissionsQuery.data?.data],
  )
  const hasActiveFilters = Boolean(filters.kind || filters.scope)

  const roles = useMemo(
    () =>
      allRoles.filter((role) => {
        if (filters.kind === 'system' && !role.isSystem) return false
        if (filters.kind === 'custom' && role.isSystem) return false
        if (filters.scope === 'all' && !role.canViewAllData) return false
        if (filters.scope === 'own' && role.canViewAllData) return false
        return true
      }),
    [allRoles, filters.kind, filters.scope],
  )

  const loaded = permissionsQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')

  const listFilters = (
    <ListToolbarFilters>
      <ListFilterSelect
        label="Type"
        ariaLabel="Filter by role type"
        value={filters.kind}
        onChange={(kind) => setFilters((current) => ({ ...current, kind }))}
        options={KIND_FILTER_OPTIONS}
      />
      <ListFilterSelect
        label="Records"
        ariaLabel="Filter by which records the role can see"
        value={filters.scope}
        onChange={(scope) => setFilters((current) => ({ ...current, scope }))}
        options={SCOPE_FILTER_OPTIONS}
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
          eyebrow="Access"
          title="Roles"
          description="A role is a set of things someone is allowed to do. Create a role, tick what it allows, then give it to people on their profile."
          theme="ink"
          pattern="grid"
          stats={[
            {
              id: 'all',
              label: 'Roles',
              value: stat(allRoles.length),
              icon: ShieldCheck,
              caption: loaded
                ? `${allRoles.reduce((sum, role) => sum + role.memberCount, 0)} role assignments`
                : undefined,
              hint: 'Show all roles',
              active: !hasActiveFilters,
              onSelect: () => setFilters({ ...EMPTY_FILTERS }),
            },
            {
              id: 'custom',
              label: 'Custom',
              value: stat(allRoles.filter((role) => !role.isSystem).length),
              icon: Lock,
              caption: loaded
                ? `${allRoles.filter((role) => role.isSystem).length} built-in`
                : undefined,
              hint: 'Show custom roles only',
              active: filters.kind === 'custom' && !filters.scope,
              onSelect: () => setFilters({ kind: 'custom', scope: '' }),
            },
            {
              id: 'see-all',
              label: 'See all records',
              value: stat(allRoles.filter((role) => role.canViewAllData).length),
              icon: Eye,
              caption: 'Not limited to their own',
              hint: 'Show roles that can see every record',
              active: filters.scope === 'all' && !filters.kind,
              onSelect: () => setFilters({ kind: '', scope: 'all' }),
            },
          ]}
          spotlight={
            <Can managerOnly>
              <HeroSpotlight
                title="Create a role"
                description="Name it, then tick only what it should allow."
                actions={
                  <HeroPillButton
                    icon={Plus}
                    onClick={() =>
                      void navigate({ to: '/staff-permissions/new' })
                    }
                  >
                    New role
                  </HeroPillButton>
                }
              />
            </Can>
          }
        />

        {permissionsQuery.isLoading ? (
          <StaffPermissionListLoadingState />
        ) : null}

        {permissionsQuery.isError ? (
          <StaffPermissionListErrorState
            onRetry={() => void permissionsQuery.refetch()}
          />
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="All roles"
              description="Built-in roles also decide which lists and portals someone uses."
              totalLabel="roles"
              columns={staffPermissionListColumns}
              data={roles}
              searchPlaceholder="Search by role name or description..."
              searchVariant="pill"
              globalFilterFn={filterStaffPermission}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters ? 'No roles match these filters' : 'No roles yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
