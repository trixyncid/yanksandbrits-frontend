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
import { TutorAllocationHero } from '../components/tutor-allocation-hero'
import { tutorAllocationListColumns } from '../components/tutor-allocation-list-columns'
import {
  TutorAllocationListErrorState,
  TutorAllocationListLoadingState,
} from '../components/tutor-allocation-list-states'
import { useTutorAllocationsQuery } from '../hooks/use-tutor-allocations-query'
import {
  ALLOCATION_STAGE_LABEL,
  allocationStage,
  type AllocationStage,
} from '../lib/allocation-status'
import { programLabel } from '../lib/programs'
import type { TutorAllocationListItem } from '../types/tutor-allocation'

function filterAllocation(row: TutorAllocationListItem, search: string) {
  const haystack = [
    row.classType,
    row.branchName,
    row.program,
    programLabel(row.program),
    ...row.computerSciencePrograms.flatMap((line) => [
      line.programCode,
      line.programTitle,
      line.note,
    ]),
    row.listeningProgramCode,
    row.listeningProgramTitle,
    row.readingProgramCode,
    row.readingProgramTitle,
    row.writingProgramCode,
    row.writingProgramTitle,
    row.speakingProgramCode,
    row.speakingProgramTitle,
    row.mathProgramCode,
    row.mathProgramTitle,
    row.generalEnglishUnit1ProgramCode,
    row.generalEnglishUnit1ProgramTitle,
    row.generalEnglishUnit2ProgramCode,
    row.generalEnglishUnit2ProgramTitle,
    row.generalEnglishGrammarProgramCode,
    row.generalEnglishGrammarProgramTitle,
    row.course ?? '',
    ...row.members.flatMap((member) => [member.studentName, member.pin, member.grn]),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(search)
}

type AllocationListFilterState = {
  stage: AllocationStage | ''
  classType: string
}

const EMPTY_FILTERS: AllocationListFilterState = { stage: '', classType: '' }

const STAGE_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  ...(Object.keys(ALLOCATION_STAGE_LABEL) as AllocationStage[]).map(
    (stage) => ({ value: stage, label: ALLOCATION_STAGE_LABEL[stage] }),
  ),
]

const CLASS_TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'private', label: 'Private' },
  { value: 'group', label: 'Group' },
]

export default function TutorAllocationListPage() {
  const navigate = useNavigate()
  const allocationsQuery = useTutorAllocationsQuery()
  const [filters, setFilters] = useSessionState<AllocationListFilterState>(
    'list-filters:tutor-allocations',
    { ...EMPTY_FILTERS },
  )
  const allAllocations = useMemo(
    () => allocationsQuery.data?.data ?? [],
    [allocationsQuery.data?.data],
  )
  const hasActiveFilters = Boolean(filters.stage || filters.classType)
  const allocations = useMemo(
    () =>
      allAllocations.filter((allocation) => {
        if (filters.stage && allocationStage(allocation) !== filters.stage) {
          return false
        }
        if (filters.classType && allocation.classType !== filters.classType) {
          return false
        }
        return true
      }),
    [allAllocations, filters.stage, filters.classType],
  )
  const loaded = allocationsQuery.isSuccess
  const countStage = (stage: AllocationStage) =>
    loaded
      ? allAllocations.filter(
          (allocation) => allocationStage(allocation) === stage,
        ).length
      : '–'

  const listFilters = (
    <ListToolbarFilters>
      <ListFilterSelect
        label="Status"
        ariaLabel="Filter by status"
        value={filters.stage}
        onChange={(stage) =>
          setFilters((current) => ({
            ...current,
            stage: stage as AllocationStage | '',
          }))
        }
        options={STAGE_FILTER_OPTIONS}
      />
      <ListFilterSelect
        label="Type"
        ariaLabel="Filter by class type"
        value={filters.classType}
        onChange={(classType) =>
          setFilters((current) => ({ ...current, classType }))
        }
        options={CLASS_TYPE_FILTER_OPTIONS}
      />
      <ClearListFiltersButton
        visible={hasActiveFilters}
        onClear={() => setFilters({ ...EMPTY_FILTERS })}
        className="h-10 rounded-full border-transparent bg-ink text-white hover:bg-ink-soft hover:text-white"
      />
    </ListToolbarFilters>
  )

  function openCreate() {
    void navigate({ to: '/tutor-allocations/new' })
  }

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <TutorAllocationHero
          total={loaded ? allAllocations.length : '–'}
          awaiting={countStage('awaiting')}
          needTutors={countStage('approved')}
          assigned={countStage('assigned')}
          stageFilter={filters.stage}
          onFilter={(stage) => setFilters({ stage, classType: '' })}
          onAdd={openCreate}
        />

        {allocationsQuery.isLoading ? <TutorAllocationListLoadingState /> : null}

        {allocationsQuery.isError ? (
          <div className="space-y-2">
            {listFilters}
            <TutorAllocationListErrorState
              onRetry={() => void allocationsQuery.refetch()}
            />
          </div>
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="Classes"
              description="Open a class to approve it, assign tutors, or hand the program to its students."
              totalLabel="classes"
              columns={tutorAllocationListColumns}
              data={allocations}
              searchPlaceholder="Search by student, PIN or program..."
              searchVariant="pill"
              globalFilterFn={filterAllocation}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No classes match these filters'
                  : 'No classes yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
