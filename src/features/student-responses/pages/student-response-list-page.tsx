import { useNavigate } from '@tanstack/react-router'
import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { studentResponseListColumns } from '../components/student-response-list-columns'
import {
  StudentResponseListErrorState,
  StudentResponseListLoadingState,
} from '../components/student-response-list-states'
import { useStudentResponsesQuery } from '../hooks/use-student-responses-query'
import type { StudentResponseListItem } from '../types/student-response'

function filterStudentResponse(row: StudentResponseListItem, search: string) {
  const haystack = [
    row.studentPin,
    row.studentName,
    row.studentEmail,
    row.studentPhone,
    row.title,
    row.tutorPin,
    row.tutorName,
    row.description,
    row.status,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function StudentResponseListPage() {
  const navigate = useNavigate()
  const responsesQuery = useStudentResponsesQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {responsesQuery.isLoading ? <StudentResponseListLoadingState /> : null}

        {responsesQuery.isError ? (
          <StudentResponseListErrorState
            onRetry={() => void responsesQuery.refetch()}
          />
        ) : null}

        {responsesQuery.isSuccess ? (
          <DataTable
            title="Student Response List"
            description="Review tutor and student response records."
            totalLabel="responses"
            columns={studentResponseListColumns}
            data={responsesQuery.data.data}
            searchPlaceholder="Search by student, tutor, title, status..."
            globalFilterFn={filterStudentResponse}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No student responses found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={responsesQuery.isFetching}
                  onClick={() => {
                    void responsesQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Student responses refreshed',
                        description: 'Latest response data has been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${responsesQuery.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() =>
                    void navigate({ to: '/student-responses/new' })
                  }
                >
                  <Plus className="size-4" />
                  Add New Student Response
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
