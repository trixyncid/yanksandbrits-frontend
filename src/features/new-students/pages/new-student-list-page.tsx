import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { newStudentListColumns } from '../components/new-student-list-columns'
import {
  NewStudentListErrorState,
  NewStudentListLoadingState,
} from '../components/new-student-list-states'
import { useNewStudentsQuery } from '../hooks/use-new-students-query'
import type { NewStudentListItem } from '../types/new-student'

function filterNewStudent(row: NewStudentListItem, search: string) {
  const haystack = [
    row.fullName,
    row.email,
    row.phone,
    row.course,
    row.status,
    row.educationCounsellor,
    row.branch,
    row.gender,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function NewStudentListPage() {
  const studentsQuery = useNewStudentsQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {studentsQuery.isLoading ? <NewStudentListLoadingState /> : null}

        {studentsQuery.isError ? (
          <NewStudentListErrorState
            onRetry={() => void studentsQuery.refetch()}
          />
        ) : null}

        {studentsQuery.isSuccess ? (
          <DataTable
            title="New Student List"
            description={
              studentsQuery.data.meta.source === 'placeholder'
                ? 'Track marketing leads and new student inquiries. Currently using placeholder data until the API is connected.'
                : 'Track marketing leads and new student inquiries.'
            }
            totalLabel="students"
            columns={newStudentListColumns}
            data={studentsQuery.data.data}
            searchPlaceholder="Search by name, course, status, counsellor..."
            globalFilterFn={filterNewStudent}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No new students found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={studentsQuery.isFetching}
                  onClick={() => {
                    void studentsQuery.refetch().then(() => {
                      notify('success', {
                        title: 'New students refreshed',
                        description: 'Latest placeholder data has been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${studentsQuery.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() =>
                    notify('info', {
                      title: 'Add new student placeholder',
                      description:
                        'The create new student form will be added later.',
                    })
                  }
                >
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
