import { useNavigate } from '@tanstack/react-router'
import { GraduationCap, Plus, UserCheck, UserMinus } from 'lucide-react'
import { useMemo } from 'react'

import {
  ClearListFiltersButton,
  DataTable,
  ListFilterSearchSelect,
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
import { useMarketingOptionsQuery } from '../../users/hooks/use-user-options'
import { studentListColumns } from '../components/student-list-columns'
import {
  StudentListErrorState,
  StudentListLoadingState,
} from '../components/student-list-states'
import { useStudentsQuery } from '../hooks/use-students-query'
import type { StudentListItem } from '../types/student'

function filterStudent(row: StudentListItem, search: string) {
  const haystack = [
    row.pin,
    row.grn,
    row.fullName,
    row.email,
    row.mobilePhone,
    row.counsellor,
    row.branch,
    row.status,
    row.gender === 'M' ? 'male' : 'female',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

const EMPTY_FILTERS = { counsellorId: '', status: '' } as const

type StudentListFilterState = {
  counsellorId: string
  /** Quick filter from the hero stats; applied on the loaded list only. */
  status: string
}

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function StudentListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useSessionState<StudentListFilterState>(
    'list-filters:students',
    { ...EMPTY_FILTERS },
  )
  const hideCounsellorFilter = useIsRestrictedMarketing()
  const counsellorsQuery = useMarketingOptionsQuery()
  const counsellorOptions = useMemo(
    () => [
      { value: '', label: 'All counsellors' },
      ...(counsellorsQuery.data ?? []).map((option) => ({
        value: option.id,
        label: option.pin
          ? `${option.pin} · ${option.fullName}`
          : option.fullName,
        keywords: `${option.pin} ${option.fullName} ${option.email}`,
      })),
    ],
    [counsellorsQuery.data],
  )
  const statusFilter = filters.status ?? ''
  const hasCounsellorFilter =
    !hideCounsellorFilter && Boolean(filters.counsellorId)
  const hasActiveFilters = hasCounsellorFilter || Boolean(statusFilter)
  const studentsQuery = useStudentsQuery({
    counsellorId: hideCounsellorFilter
      ? undefined
      : filters.counsellorId || undefined,
  })
  const allStudents = useMemo(
    () => studentsQuery.data?.data ?? [],
    [studentsQuery.data?.data],
  )
  const students = useMemo(
    () =>
      statusFilter
        ? allStudents.filter((student) => student.status === statusFilter)
        : allStudents,
    [allStudents, statusFilter],
  )

  const loaded = studentsQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')
  const activeCount = allStudents.filter(
    (student) => student.status === 'active',
  ).length
  const withAccountCount = allStudents.filter(
    (student) => student.hasAccount,
  ).length

  const clearFilters = () => setFilters({ ...EMPTY_FILTERS })
  const setStatus = (status: string) =>
    setFilters((current) => ({ ...current, status }))

  function openCreate() {
    void navigate({
      to: '/students/new',
      search: { prospectiveStudentId: undefined },
    })
  }

  const listFilters = (
    <ListToolbarFilters>
      <ListFilterSelect
        label="Status"
        ariaLabel="Filter by status"
        value={statusFilter}
        onChange={setStatus}
        options={STATUS_FILTER_OPTIONS}
      />
      {hideCounsellorFilter ? null : (
        <ListFilterSearchSelect
          label="Counsellor"
          ariaLabel="Filter by counsellor"
          value={filters.counsellorId}
          onChange={(counsellorId) =>
            setFilters((current) => ({ ...current, counsellorId }))
          }
          options={counsellorOptions}
          disabled={counsellorsQuery.isLoading}
          searchPlaceholder="Search by name or PIN"
          emptyMessage="No counsellors found"
        />
      )}
      <ClearListFiltersButton
        visible={hasActiveFilters}
        onClear={clearFilters}
        className="h-10 rounded-full border-transparent bg-ink text-white hover:bg-ink-soft hover:text-white"
      />
    </ListToolbarFilters>
  )

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <PageHero
          eyebrow="Students"
          title="Students"
          description="Everyone enrolled with us: their branch, counsellor, and whether they're currently studying."
          theme="harbor"
          pattern="waves"
          stats={[
            {
              id: 'all',
              label: 'Students',
              value: stat(allStudents.length),
              icon: GraduationCap,
              caption: loaded
                ? `${withAccountCount} with a student app account`
                : undefined,
              hint: 'Show all students',
              active: !statusFilter,
              onSelect: () => setStatus(''),
            },
            {
              id: 'active',
              label: 'Active',
              value: stat(activeCount),
              icon: UserCheck,
              hint: 'Show active students only',
              active: statusFilter === 'active',
              onSelect: () => setStatus('active'),
            },
            {
              id: 'inactive',
              label: 'Inactive',
              value: stat(allStudents.length - activeCount),
              icon: UserMinus,
              hint: 'Show inactive students only',
              active: statusFilter === 'inactive',
              onSelect: () => setStatus('inactive'),
            },
          ]}
          spotlight={
            <Can module="students" action="add">
              <HeroSpotlight
                title="Enroll a student"
                description="Start fresh or convert an existing prospective student."
                actions={
                  <HeroPillButton icon={Plus} onClick={openCreate}>
                    Add student
                  </HeroPillButton>
                }
              />
            </Can>
          }
        />

        {studentsQuery.isLoading ? <StudentListLoadingState /> : null}

        {studentsQuery.isError ? (
          <div className="space-y-2">
            {listFilters}
            <StudentListErrorState
              onRetry={() => void studentsQuery.refetch()}
            />
          </div>
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="Student Directory"
              description="Search, filter, and open any student record."
              totalLabel="students"
              columns={studentListColumns}
              data={students}
              searchPlaceholder="Search by name, PIN, email, or phone..."
              searchVariant="pill"
              globalFilterFn={filterStudent}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No students match these filters'
                  : 'No students yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
