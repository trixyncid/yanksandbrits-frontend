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
import { BranchHero } from '../components/branch-hero'
import { branchListColumns } from '../components/branch-list-columns'
import {
  BranchListErrorState,
  BranchListLoadingState,
} from '../components/branch-list-states'
import { useBranchesQuery } from '../hooks/use-branches-query'
import type { BranchListItem } from '../types/branch'

function filterBranch(row: BranchListItem, search: string) {
  const haystack = [
    row.name,
    row.phone,
    row.address,
    String(row.totalStudent),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

type BranchListFilterState = {
  students: string
}

const EMPTY_FILTERS: BranchListFilterState = { students: '' }

const STUDENT_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'some', label: 'Has students' },
  { value: 'none', label: 'No students yet' },
]

export default function BranchListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useSessionState<BranchListFilterState>(
    'list-filters:branches',
    { ...EMPTY_FILTERS },
  )
  const branchesQuery = useBranchesQuery()
  const allBranches = useMemo(
    () => branchesQuery.data?.data ?? [],
    [branchesQuery.data?.data],
  )
  const hasActiveFilters = Boolean(filters.students)

  const branches = useMemo(
    () =>
      allBranches.filter((branch) => {
        if (filters.students === 'some' && branch.totalStudent <= 0) {
          return false
        }
        if (filters.students === 'none' && branch.totalStudent > 0) {
          return false
        }
        return true
      }),
    [allBranches, filters.students],
  )

  const loaded = branchesQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')
  const mainBranch = allBranches.find((branch) => branch.isMain)

  const listFilters = (
    <ListToolbarFilters>
      <ListFilterSelect
        label="Students"
        ariaLabel="Filter by students"
        value={filters.students}
        onChange={(students) =>
          setFilters((current) => ({ ...current, students }))
        }
        options={STUDENT_FILTER_OPTIONS}
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
        <BranchHero
          total={stat(allBranches.length)}
          students={stat(
            allBranches.reduce((sum, branch) => sum + branch.totalStudent, 0),
          )}
          withoutStudents={stat(
            allBranches.filter((branch) => branch.totalStudent <= 0).length,
          )}
          mainBranchName={mainBranch?.name ?? null}
          studentFilter={filters.students}
          onShowAll={() => setFilters({ ...EMPTY_FILTERS })}
          onShowWithoutStudents={() => setFilters({ students: 'none' })}
          onAdd={() => void navigate({ to: '/branches/new' })}
        />

        {branchesQuery.isLoading ? <BranchListLoadingState /> : null}

        {branchesQuery.isError ? (
          <BranchListErrorState
            onRetry={() => void branchesQuery.refetch()}
          />
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="All Branches"
              description="Contact details and how many students each branch has."
              totalLabel="branches"
              columns={branchListColumns}
              data={branches}
              searchPlaceholder="Search by name, phone, or address..."
              searchVariant="pill"
              globalFilterFn={filterBranch}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No branches match this filter'
                  : 'No branches yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
