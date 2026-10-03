import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'

import {
  ClearListFiltersButton,
  DataTable,
  ListFilterSearchSelect,
  ListToolbarFilters,
} from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
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

const EMPTY_FILTERS = { counsellorId: '' } as const

type ProspectiveStudentListFilterState = {
  counsellorId: string
}

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
  const hasActiveFilters = !hideCounsellorFilter && Boolean(filters.counsellorId)
  const studentsQuery = useProspectiveStudentsQuery({
    counsellorId: hideCounsellorFilter
      ? undefined
      : filters.counsellorId || undefined,
  })

  const clearFilters = () => setFilters({ ...EMPTY_FILTERS })

  function openCreate() {
    void navigate({ to: '/prospective-students/new' })
  }

  const listFilters = hideCounsellorFilter ? undefined : (
    <ListToolbarFilters>
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
      <ClearListFiltersButton
        visible={hasActiveFilters}
        onClear={clearFilters}
        className="h-10 rounded-full border-slate-200 bg-white hover:bg-slate-50"
      />
    </ListToolbarFilters>
  )

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
              Prospective Students
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Track marketing leads and prospective student inquiries.
            </p>
          </div>
          <Can module="prospectiveStudents" action="add">
            <Button
              onClick={openCreate}
              className="rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Add Prospective Student
            </Button>
          </Can>
        </div>

        {studentsQuery.isLoading ? <ProspectiveStudentListLoadingState /> : null}

        {studentsQuery.isError ? (
          <div className="space-y-2">
            {listFilters}
            <ProspectiveStudentListErrorState
              onRetry={() => void studentsQuery.refetch()}
            />
          </div>
        ) : null}

        {studentsQuery.isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              title="Leads"
              description="Search and manage prospective student records."
              totalLabel="leads"
              columns={prospectiveStudentListColumns}
              data={studentsQuery.data.data}
              searchPlaceholder="Search by student name..."
              searchVariant="pill"
              globalFilterFn={filterProspectiveStudent}
              initialPageSize={10}
              emptyMessage="No prospective students found"
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
