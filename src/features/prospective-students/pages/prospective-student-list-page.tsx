import { useNavigate } from '@tanstack/react-router'
import { ClipboardCheck, GraduationCap, Inbox, Plus } from 'lucide-react'
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
import { prospectiveStudentListColumns } from '../components/prospective-student-list-columns'
import {
  ProspectiveStudentListErrorState,
  ProspectiveStudentListLoadingState,
} from '../components/prospective-student-list-states'
import { useProspectiveStudentsQuery } from '../hooks/use-prospective-students-query'
import type { ProspectiveStudentListItem } from '../types/prospective-student'

function filterProspectiveStudent(row: ProspectiveStudentListItem, search: string) {
  return row.fullName.toLowerCase().includes(search)
}

type ProspectiveStudentListFilterState = {
  counsellorId: string
  /** Applied on the page only; the server filter stays the counsellor. */
  status?: string
}

const EMPTY_FILTERS: ProspectiveStudentListFilterState = {
  counsellorId: '',
  status: '',
}

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'consult', label: 'Consult' },
  { value: 'prediction_test', label: 'Pre-Test' },
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function ProspectiveStudentListPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useSessionState<ProspectiveStudentListFilterState>(
    'list-filters:prospective-students',
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
  const hasActiveFilters =
    (!hideCounsellorFilter && Boolean(filters.counsellorId)) ||
    Boolean(statusFilter)
  const studentsQuery = useProspectiveStudentsQuery({
    counsellorId: hideCounsellorFilter
      ? undefined
      : filters.counsellorId || undefined,
  })

  const allLeads = useMemo(
    () => studentsQuery.data?.data ?? [],
    [studentsQuery.data?.data],
  )
  const leads = useMemo(
    () =>
      statusFilter
        ? allLeads.filter((lead) => lead.status === statusFilter)
        : allLeads,
    [allLeads, statusFilter],
  )
  const loaded = studentsQuery.isSuccess
  const countStatus = (status: string) =>
    loaded ? allLeads.filter((lead) => lead.status === status).length : '–'
  const setStatus = (status: string) =>
    setFilters((current) => ({ ...current, status }))

  const clearFilters = () => setFilters({ ...EMPTY_FILTERS })

  function openCreate() {
    void navigate({ to: '/prospective-students/new' })
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
          eyebrow="Leads"
          title="Student Responses"
          description="Everyone who has asked about a course, from first consult to enrollment, with the counsellor following up."
          theme="sky"
          pattern="ribbons"
          stats={[
            {
              id: 'all',
              label: 'Leads',
              value: loaded ? allLeads.length : '–',
              icon: Inbox,
              hint: 'Show every lead',
              active: !statusFilter,
              onSelect: () => setStatus(''),
            },
            {
              id: 'prediction-test',
              label: 'Pre-Test',
              value: countStatus('prediction_test'),
              icon: ClipboardCheck,
              caption: 'Waiting on a prediction test',
              hint: 'Show leads at the pre-test stage',
              active: statusFilter === 'prediction_test',
              onSelect: () => setStatus('prediction_test'),
            },
            {
              id: 'enrolled',
              label: 'Enrolled',
              value: countStatus('enrolled'),
              icon: GraduationCap,
              caption: 'Became students',
              hint: 'Show enrolled leads',
              active: statusFilter === 'enrolled',
              onSelect: () => setStatus('enrolled'),
            },
          ]}
          spotlight={
            <Can module="prospectiveStudents" action="add">
              <HeroSpotlight
                title="New inquiry?"
                description="Log the student and who is following up."
                actions={
                  <HeroPillButton icon={Plus} onClick={openCreate}>
                    Add student response
                  </HeroPillButton>
                }
              />
            </Can>
          }
        />

        {studentsQuery.isLoading ? <ProspectiveStudentListLoadingState /> : null}

        {studentsQuery.isError ? (
          <div className="space-y-2">
            {listFilters}
            <ProspectiveStudentListErrorState
              onRetry={() => void studentsQuery.refetch()}
            />
          </div>
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="Leads"
              description="Search by name, then filter by stage or counsellor."
              totalLabel="leads"
              columns={prospectiveStudentListColumns}
              data={leads}
              searchPlaceholder="Search by student name..."
              searchVariant="pill"
              globalFilterFn={filterProspectiveStudent}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No leads match these filters'
                  : 'No student responses yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
