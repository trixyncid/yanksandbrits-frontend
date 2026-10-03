import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import {
  ClearListFiltersButton,
  DataTable,
  ListToolbarFilters,
} from '../../../shared/components/data-table'
import { FeaturePageAtmosphere } from '../../../shared/components/feature-page'
import { Button } from '../../../shared/components/ui/button'
import { Select } from '../../../shared/components/ui/select'
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
  const hasActiveFilters = !hideCounsellorFilter && Boolean(filters.counsellorId)
  const studentsQuery = useStudentsQuery({
    counsellorId: hideCounsellorFilter
      ? undefined
      : filters.counsellorId || undefined,
  })

  const clearFilters = () => setFilters({ ...EMPTY_FILTERS })

  const listFilters = hideCounsellorFilter ? undefined : (
    <ListToolbarFilters>
      <Select
        value={filters.counsellorId}
        onChange={(event) =>
          setFilters((current) => ({
            ...current,
            counsellorId: event.target.value,
          }))
        }
        containerClassName="w-full sm:w-[220px]"
        className="h-9 border-white/80 bg-white/80 py-1.5 shadow-sm backdrop-blur-md"
        aria-label="Filter by counsellor"
      >
        <option value="">All counsellors</option>
        {(counsellorsQuery.data ?? []).map((option) => (
          <option key={option.id} value={option.id}>
            {option.pin} | {option.fullName}
          </option>
        ))}
      </Select>
      <ClearListFiltersButton visible={hasActiveFilters} onClear={clearFilters} />
    </ListToolbarFilters>
  )

  return (
    <AdminShell>
      <FeaturePageAtmosphere>
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-2">
          {studentsQuery.isLoading ? <StudentListLoadingState /> : null}

          {studentsQuery.isError ? (
            <div className="space-y-2">
              {listFilters ? (
                <div className="flex justify-end">{listFilters}</div>
              ) : null}
              <StudentListErrorState
                onRetry={() => void studentsQuery.refetch()}
              />
            </div>
          ) : null}

          {studentsQuery.isSuccess ? (
            <DataTable
              variant="glass"
              title="Student List"
              description="Browse, search, and manage enrolled students."
              totalLabel="students"
              columns={studentListColumns}
              data={studentsQuery.data.data}
              searchPlaceholder="Search by name, PIN, email, branch..."
              globalFilterFn={filterStudent}
              initialPageSize={10}
              emptyMessage="No students found"
              toolbarFilters={listFilters}
              toolbarActions={
                <Can module="students" action="add">
                  <Button
                    size="sm"
                    onClick={() =>
                      void navigate({
                        to: '/students/new',
                        search: { prospectiveStudentId: undefined },
                      })
                    }
                  >
                    <Plus className="size-4" />
                    Add New Student
                  </Button>
                </Can>
              }
            />
          ) : null}
        </div>
      </FeaturePageAtmosphere>
    </AdminShell>
  )
}
