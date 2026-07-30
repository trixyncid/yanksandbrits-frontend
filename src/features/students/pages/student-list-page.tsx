import { useNavigate } from '@tanstack/react-router'
import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
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
  const studentsQuery = useStudentsQuery()

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
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No students found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={studentsQuery.isFetching}
                  onClick={() => {
                    void studentsQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Student list refreshed',
                        description: 'Latest students have been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${studentsQuery.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button onClick={() => void navigate({ to: '/students/new' })}>
                  <Plus className="size-4" />
                  Add New Student
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
