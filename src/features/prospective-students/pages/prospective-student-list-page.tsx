import { useNavigate } from '@tanstack/react-router'
import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { prospectiveStudentListColumns } from '../components/prospective-student-list-columns'
import {
  ProspectiveStudentListErrorState,
  ProspectiveStudentListLoadingState,
} from '../components/prospective-student-list-states'
import { useProspectiveStudentsQuery } from '../hooks/use-prospective-students-query'
import type { ProspectiveStudentListItem } from '../types/prospective-student'

function filterProspectiveStudent(row: ProspectiveStudentListItem, search: string) {
  const haystack = [
    row.fullName,
    row.email,
    row.phone,
    row.course,
    row.status,
    row.educationCounsellor,
    row.branch,
    row.gender ?? '',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function ProspectiveStudentListPage() {
  const navigate = useNavigate()
  const studentsQuery = useProspectiveStudentsQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {studentsQuery.isLoading ? <ProspectiveStudentListLoadingState /> : null}

        {studentsQuery.isError ? (
          <ProspectiveStudentListErrorState
            onRetry={() => void studentsQuery.refetch()}
          />
        ) : null}

        {studentsQuery.isSuccess ? (
          <DataTable
            title="Prospective Student List"
            description="Track marketing leads and prospective student inquiries."
            totalLabel="leads"
            columns={prospectiveStudentListColumns}
            data={studentsQuery.data.data}
            searchPlaceholder="Search by name, course, status, counsellor..."
            globalFilterFn={filterProspectiveStudent}
            initialPageSize={10}
            emptyMessage="No prospective students found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={studentsQuery.isFetching}
                  onClick={() => {
                    void studentsQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Prospective students refreshed',
                        description: 'Latest leads have been loaded.',
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
                  onClick={() => void navigate({ to: '/prospective-students/new' })}
                >
                  <Plus className="size-4" />
                  Add Prospective Student
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
