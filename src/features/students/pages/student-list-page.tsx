import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
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

export default function StudentListPage() {
  const navigate = useNavigate()
  const [counsellorId, setCounsellorId] = useState('')
  const counsellorsQuery = useMarketingOptionsQuery()
  const counsellorOptions = useMemo(
    () =>
      (counsellorsQuery.data ?? []).map((option) => ({
        value: option.id,
        label: `${option.pin} | ${option.fullName}`,
        keywords: `${option.pin} ${option.fullName} ${option.email}`,
      })),
    [counsellorsQuery.data],
  )
  const studentsQuery = useStudentsQuery({
    counsellorId: counsellorId || undefined,
  })

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {studentsQuery.isLoading ? <StudentListLoadingState /> : null}

        {studentsQuery.isError ? (
          <StudentListErrorState onRetry={() => void studentsQuery.refetch()} />
        ) : null}

        {studentsQuery.isSuccess ? (
          <DataTable
            title="Student List"
            description="Browse, search, and manage enrolled students."
            totalLabel="students"
            columns={studentListColumns}
            data={studentsQuery.data.data}
            searchPlaceholder="Search by name, PIN, email, branch..."
            globalFilterFn={filterStudent}
            initialPageSize={10}
            emptyMessage="No students found"
            toolbarActions={
              <div className="flex items-center gap-2">
                <SearchableSelect
                  value={counsellorId}
                  options={counsellorOptions}
                  onChange={setCounsellorId}
                  placeholder="All counsellors"
                  searchPlaceholder="Search counsellors..."
                  emptyMessage="No counsellors found"
                  disabled={counsellorsQuery.isLoading}
                  clearable
                  className="h-11 w-[240px]"
                />
                <Can module="students" action="add">
                  <Button
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
              </div>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
