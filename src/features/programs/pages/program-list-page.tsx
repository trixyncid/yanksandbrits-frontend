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
import { STAFF_TYPE_OPTIONS } from '../../users/api/users-api'
import { ProgramHero } from '../components/program-hero'
import { programListColumns } from '../components/program-list-columns'
import {
  ProgramListErrorState,
  ProgramListLoadingState,
} from '../components/program-list-states'
import { useProgramsQuery } from '../hooks/use-programs-query'
import { PROGRAM_AUDIENCE_OPTIONS, type ProgramListItem } from '../types/program'

function filterProgram(row: ProgramListItem, search: string) {
  return [row.code, row.title, row.description, row.subject, row.audience]
    .join(' ')
    .toLowerCase()
    .includes(search)
}

type ProgramListFilterState = {
  subject: string
  audience: string
  status: string
}

const EMPTY_FILTERS: ProgramListFilterState = { subject: '', audience: '', status: '' }

const AUDIENCE_FILTER_OPTIONS = [
  { value: '', label: 'Everyone' },
  ...PROGRAM_AUDIENCE_OPTIONS,
]

const SUBJECT_FILTER_OPTIONS = [
  { value: '', label: 'All subjects' },
  ...STAFF_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
  { value: 'none', label: 'No subject' },
]

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]


export default function ProgramListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useSessionState<ProgramListFilterState>(
    'list-filters:programs',
    { ...EMPTY_FILTERS },
  )
  const programsQuery = useProgramsQuery()
  const allPrograms = useMemo(
    () => programsQuery.data?.data ?? [],
    [programsQuery.data?.data],
  )
  const hasActiveFilters = Boolean(filters.subject || filters.audience || filters.status)

  const programs = useMemo(
    () =>
      allPrograms.filter((program) => {
        if (filters.subject === 'none' && program.subject) return false
        if (
          filters.subject &&
          filters.subject !== 'none' &&
          program.subject !== filters.subject
        ) {
          return false
        }
        if (filters.audience && program.audience !== filters.audience) return false
        if (filters.status === 'active' && !program.isActive) return false
        if (filters.status === 'inactive' && program.isActive) return false
        return true
      }),
    [allPrograms, filters.subject, filters.audience, filters.status],
  )

  const loaded = programsQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')

  const listFilters = (
    <ListToolbarFilters>
      <ListFilterSelect
        label="Subject"
        ariaLabel="Filter by subject"
        value={filters.subject}
        onChange={(subject) =>
          setFilters((current) => ({ ...current, subject }))
        }
        options={SUBJECT_FILTER_OPTIONS}
      />
      <ListFilterSelect
        label="Intended for"
        ariaLabel="Filter by who the program is for"
        value={filters.audience ?? ''}
        onChange={(audience) => setFilters((current) => ({ ...current, audience }))}
        options={AUDIENCE_FILTER_OPTIONS}
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
        <ProgramHero
          total={stat(allPrograms.length)}
          active={stat(allPrograms.filter((program) => program.isActive).length)}
          withoutSubject={stat(
            allPrograms.filter((program) => !program.subject).length,
          )}
          statusFilter={filters.status}
          subjectFilter={filters.subject}
          onShowAll={() => setFilters({ ...EMPTY_FILTERS })}
          onShowActive={() => setFilters({ ...EMPTY_FILTERS, status: 'active' })}
          onShowWithoutSubject={() =>
            setFilters({ ...EMPTY_FILTERS, subject: 'none' })
          }
          onAdd={() => void navigate({ to: '/programs/new' })}
        />

        {programsQuery.isLoading ? <ProgramListLoadingState /> : null}

        {programsQuery.isError ? (
          <div className="space-y-2">
            {listFilters}
            <ProgramListErrorState
              onRetry={() => void programsQuery.refetch()}
            />
          </div>
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="Program Catalog"
              description="Search, filter, and manage every program."
              totalLabel="programs"
              columns={programListColumns}
              data={programs}
              searchPlaceholder="Search by code, title, or subject..."
              searchVariant="pill"
              globalFilterFn={filterProgram}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No programs match these filters'
                  : 'No programs yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
