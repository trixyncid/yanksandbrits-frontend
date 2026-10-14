import { useNavigate } from '@tanstack/react-router'
import { CalendarClock, CircleCheck, GraduationCap, Plus } from 'lucide-react'
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
import { tutorListColumns } from '../components/tutor-list-columns'
import {
  TutorListErrorState,
  TutorListLoadingState,
} from '../components/tutor-list-states'
import { useTutorsQuery } from '../hooks/use-tutors-query'
import type { TutorListItem } from '../types/tutor'

function filterTutor(row: TutorListItem, search: string) {
  const haystack = [
    row.pin,
    row.fullName,
    row.email,
    row.phone,
    row.gender,
    row.isActive ? 'active' : 'inactive',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

type TutorListFilterState = {
  status: string
  schedule: string
}

const EMPTY_FILTERS: TutorListFilterState = { status: '', schedule: '' }

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const SCHEDULE_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'set', label: 'Set' },
  { value: 'missing', label: 'Not set yet' },
]

export default function TutorListPage() {
  const navigate = useNavigate()
  const tutorsQuery = useTutorsQuery()
  const [filters, setFilters] = useSessionState<TutorListFilterState>(
    'list-filters:tutors',
    { ...EMPTY_FILTERS },
  )

  const allTutors = useMemo(
    () => tutorsQuery.data?.data ?? [],
    [tutorsQuery.data?.data],
  )
  const hasActiveFilters = Boolean(filters.status || filters.schedule)

  const tutors = useMemo(
    () =>
      allTutors.filter((tutor) => {
        if (filters.status === 'active' && !tutor.isActive) return false
        if (filters.status === 'inactive' && tutor.isActive) return false
        if (filters.schedule === 'set' && !tutor.hasWorkingSchedule) return false
        if (
          filters.schedule === 'missing' &&
          (tutor.hasWorkingSchedule || tutor.employmentType === 'FL')
        ) {
          return false
        }
        return true
      }),
    [allTutors, filters.status, filters.schedule],
  )

  const loaded = tutorsQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')

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
        label="Working hours"
        ariaLabel="Filter by working hours"
        value={filters.schedule}
        onChange={(schedule) =>
          setFilters((current) => ({ ...current, schedule }))
        }
        options={SCHEDULE_FILTER_OPTIONS}
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
          title="Tutors"
          description="The people who teach your classes. Keep their working hours up to date so they can be booked on the schedule."
          theme="sky"
          pattern="dots"
          stats={[
            {
              id: 'all',
              label: 'Tutors',
              value: stat(allTutors.length),
              icon: GraduationCap,
              hint: 'Show all tutors',
              active: !hasActiveFilters,
              onSelect: () => setFilters({ ...EMPTY_FILTERS }),
            },
            {
              id: 'active',
              label: 'Active',
              value: stat(allTutors.filter((tutor) => tutor.isActive).length),
              icon: CircleCheck,
              hint: 'Show active tutors only',
              active: filters.status === 'active' && !filters.schedule,
              onSelect: () => setFilters({ status: 'active', schedule: '' }),
            },
            {
              id: 'missing-hours',
              label: 'No working hours',
              value: stat(
                allTutors.filter(
                  (tutor) =>
                    !tutor.hasWorkingSchedule && tutor.employmentType !== 'FL',
                ).length,
              ),
              icon: CalendarClock,
              caption: 'Freelancers are not counted',
              hint: 'Show tutors without working hours',
              active: filters.schedule === 'missing' && !filters.status,
              onSelect: () => setFilters({ status: '', schedule: 'missing' }),
            },
          ]}
          spotlight={
            <Can module="users" action="add">
              <HeroSpotlight
                title="Add a tutor"
                description="Create their sign-in, contract and teaching details."
                actions={
                  <HeroPillButton
                    icon={Plus}
                    onClick={() => void navigate({ to: '/tutors/new' })}
                  >
                    Add tutor
                  </HeroPillButton>
                }
              />
            </Can>
          }
        />

        {tutorsQuery.isLoading ? <TutorListLoadingState /> : null}

        {tutorsQuery.isError ? (
          <TutorListErrorState onRetry={() => void tutorsQuery.refetch()} />
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="Tutor list"
              description="Open a tutor to see their profile, pay and leave, or set working hours right from the row."
              totalLabel="tutors"
              columns={tutorListColumns}
              data={tutors}
              searchPlaceholder="Search by name, PIN, email or phone..."
              searchVariant="pill"
              globalFilterFn={filterTutor}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters ? 'No tutors match these filters' : 'No tutors yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
