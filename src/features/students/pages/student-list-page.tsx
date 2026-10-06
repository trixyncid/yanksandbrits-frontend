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

const EMPTY_FILTERS = { counsellorId: '' } as const

type StudentListFilterState = {
  counsellorId: string
}

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
  const hasActiveFilters = !hideCounsellorFilter && Boolean(filters.counsellorId)
  const studentsQuery = useStudentsQuery({
    counsellorId: hideCounsellorFilter
      ? undefined
      : filters.counsellorId || undefined,
  })

  const clearFilters = () => setFilters({ ...EMPTY_FILTERS })

  function openCreate() {
    void navigate({
      to: '/students/new',
      search: { prospectiveStudentId: undefined },
    })
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
              Students
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Browse enrolled students, their branch, and enrollment status.
            </p>
          </div>
          <Can module="students" action="add">
            <Button
              onClick={openCreate}
              className="rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Add New Student
            </Button>
          </Can>
        </div>

        {studentsQuery.isLoading ? <StudentListLoadingState /> : null}

        {studentsQuery.isError ? (
          <div className="space-y-2">
            {listFilters}
            <StudentListErrorState
              onRetry={() => void studentsQuery.refetch()}
            />
          </div>
        ) : null}

        {studentsQuery.isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              title="Students"
              description="Search and manage enrolled student records."
              totalLabel="students"
              columns={studentListColumns}
              data={studentsQuery.data.data}
              searchPlaceholder="Search by name, PIN, or email..."
              searchVariant="pill"
              globalFilterFn={filterStudent}
              initialPageSize={10}
              emptyMessage="No students found"
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
