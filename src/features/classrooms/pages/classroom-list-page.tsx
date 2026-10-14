import { useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'

import {
  ClearListFiltersButton,
  DataTable,
  ListFilterSelect,
  ListToolbarFilters,
} from '../../../shared/components/data-table'
import { useSessionState } from '../../../shared/hooks/use-session-state'
import { AdminShell } from '../../admin/components/admin-shell'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { ClassroomHero } from '../components/classroom-hero'
import { classroomListColumns } from '../components/classroom-list-columns'
import {
  ClassroomListErrorState,
  ClassroomListLoadingState,
} from '../components/classroom-list-states'
import { useClassroomsQuery } from '../hooks/use-classrooms-query'
import type { ClassroomListItem } from '../types/classroom'

function filterClassroom(row: ClassroomListItem, search: string) {
  return [row.code, row.className, row.branchName ?? '']
    .join(' ')
    .toLowerCase()
    .includes(search)
}

type ClassroomListFilterState = {
  branchId: string
  status: string
}

const EMPTY_FILTERS: ClassroomListFilterState = { branchId: '', status: '' }

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function ClassroomListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useSessionState<ClassroomListFilterState>(
    'list-filters:classrooms',
    { ...EMPTY_FILTERS },
  )
  const classroomsQuery = useClassroomsQuery()
  const branchesQuery = useBranchesQuery()
  const branchOptions = useMemo(
    () => [
      { value: '', label: 'All branches' },
      ...(branchesQuery.data?.data ?? []).map((branch) => ({
        value: branch.id,
        label: branch.name,
      })),
    ],
    [branchesQuery.data?.data],
  )
  const hasActiveFilters = Boolean(filters.branchId || filters.status)

  const allClassrooms = useMemo(
    () => classroomsQuery.data?.data ?? [],
    [classroomsQuery.data?.data],
  )

  const classrooms = useMemo(
    () =>
      allClassrooms.filter((classroom) => {
        if (filters.branchId && classroom.branchId !== filters.branchId) {
          return false
        }
        if (filters.status === 'active' && !classroom.isActive) return false
        if (filters.status === 'inactive' && classroom.isActive) return false
        return true
      }),
    [allClassrooms, filters.branchId, filters.status],
  )

  const loaded = classroomsQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')
  const branchesWithRooms = new Set(
    allClassrooms
      .map((classroom) => classroom.branchId)
      .filter((branchId): branchId is string => Boolean(branchId)),
  ).size

  const listFilters = (
    <ListToolbarFilters>
      {/* One branch means there is nothing to filter between. */}
      {branchOptions.length > 2 ? (
        <ListFilterSelect
          label="Branch"
          ariaLabel="Filter by branch"
          value={filters.branchId}
          onChange={(branchId) =>
            setFilters((current) => ({ ...current, branchId }))
          }
          options={branchOptions}
        />
      ) : null}
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
        <ClassroomHero
          total={stat(allClassrooms.length)}
          active={stat(
            allClassrooms.filter((classroom) => classroom.isActive).length,
          )}
          branches={stat(branchesWithRooms)}
          statusFilter={filters.status}
          branchFilter={filters.branchId}
          onShowAll={() => setFilters({ ...EMPTY_FILTERS })}
          onShowActive={() => setFilters({ branchId: '', status: 'active' })}
          onAdd={() => void navigate({ to: '/classrooms/new' })}
        />

        {classroomsQuery.isLoading ? <ClassroomListLoadingState /> : null}

        {classroomsQuery.isError ? (
          <div className="space-y-2">
            {listFilters}
            <ClassroomListErrorState
              onRetry={() => void classroomsQuery.refetch()}
            />
          </div>
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="All rooms"
              description="Search by code, name or branch, or narrow down with the filters."
              totalLabel="classrooms"
              columns={classroomListColumns}
              data={classrooms}
              searchPlaceholder="Search by code, name, or branch..."
              searchVariant="pill"
              globalFilterFn={filterClassroom}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No classrooms match these filters'
                  : 'No classrooms yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
