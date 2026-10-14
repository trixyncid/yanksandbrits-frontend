import { useNavigate } from '@tanstack/react-router'
import { CircleCheck, Plus, UserRound, Users } from 'lucide-react'
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
import { useIsRestrictedMarketing } from '../../auth/hooks/use-permissions'
import { studentGroupListColumns } from '../components/student-group-list-columns'
import {
  StudentGroupListErrorState,
  StudentGroupListLoadingState,
} from '../components/student-group-list-states'
import { useStudentGroupsQuery } from '../hooks/use-student-groups-query'
import type { StudentGroupListItem } from '../types/student-group'

function filterStudentGroup(row: StudentGroupListItem, search: string) {
  const haystack = [
    row.groupName,
    row.createdBy,
    row.branch,
    row.status,
    ...row.members.map((member) => `${member.fullName} ${member.pin}`),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

type StudentGroupListFilterState = {
  status: string
}

const EMPTY_FILTERS: StudentGroupListFilterState = { status: '' }

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function StudentGroupListPage() {
  const navigate = useNavigate()
  const isCounsellor = useIsRestrictedMarketing()
  const groupsQuery = useStudentGroupsQuery()
  const [filters, setFilters] = useSessionState<StudentGroupListFilterState>(
    'list-filters:student-groups',
    { ...EMPTY_FILTERS },
  )

  const allGroups = useMemo(
    () => groupsQuery.data?.data ?? [],
    [groupsQuery.data?.data],
  )
  const groups = useMemo(
    () =>
      filters.status
        ? allGroups.filter((group) => group.status === filters.status)
        : allGroups,
    [allGroups, filters.status],
  )
  const groupedStudents = useMemo(
    () =>
      new Set(
        allGroups.flatMap((group) => group.members.map((member) => member.id)),
      ).size,
    [allGroups],
  )

  const hasActiveFilters = Boolean(filters.status)
  const loaded = groupsQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')
  const openCreate = () => void navigate({ to: '/student-groups/new' })

  const addSpotlight = (
    <HeroSpotlight
      title="Start a new group"
      description="Name it, then pick the students who study together."
      actions={
        <HeroPillButton icon={Plus} onClick={openCreate}>
          Add group
        </HeroPillButton>
      }
    />
  )

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
          eyebrow="Students"
          title="Student Groups"
          description="Students who learn together as one class. Active groups can be picked when scheduling."
          theme="sky"
          pattern="rings"
          stats={[
            {
              id: 'all',
              label: 'Groups',
              value: stat(allGroups.length),
              icon: Users,
              hint: 'Show all groups',
              active: !filters.status,
              onSelect: () => setFilters({ ...EMPTY_FILTERS }),
            },
            {
              id: 'active',
              label: 'Active',
              value: stat(
                allGroups.filter((group) => group.status === 'active').length,
              ),
              icon: CircleCheck,
              hint: 'Show active groups only',
              active: filters.status === 'active',
              onSelect: () => setFilters({ status: 'active' }),
            },
            {
              id: 'students',
              label: 'Students in groups',
              value: stat(groupedStudents),
              icon: UserRound,
              caption: 'Each student counted once',
            },
          ]}
          spotlight={
            isCounsellor ? (
              addSpotlight
            ) : (
              <Can module="studentGroups" action="add">
                {addSpotlight}
              </Can>
            )
          }
        />

        {groupsQuery.isLoading ? <StudentGroupListLoadingState /> : null}

        {groupsQuery.isError ? (
          <StudentGroupListErrorState
            onRetry={() => void groupsQuery.refetch()}
          />
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="All groups"
              description="Search by group name, student, or branch."
              totalLabel="groups"
              columns={studentGroupListColumns}
              data={groups}
              searchPlaceholder="Search by group, student, PIN, or branch..."
              searchVariant="pill"
              globalFilterFn={filterStudentGroup}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No groups match this filter'
                  : 'No student groups yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
