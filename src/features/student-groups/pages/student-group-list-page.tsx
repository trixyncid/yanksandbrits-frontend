import { useNavigate } from '@tanstack/react-router'
import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { studentGroupListColumns } from '../components/student-group-list-columns'
import {
  StudentGroupListErrorState,
  StudentGroupListLoadingState,
} from '../components/student-group-list-states'
import { useStudentGroupsQuery } from '../hooks/use-student-groups-query'
import type { StudentGroupListItem } from '../types/student-group'

function filterStudentGroup(row: StudentGroupListItem, search: string) {
  const haystack = [
    row.groupName,
    row.createdBy,
    row.branch,
    row.status,
    ...row.members.map((member) => `${member.fullName} ${member.pin}`),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function StudentGroupListPage() {
  const navigate = useNavigate()
  const groupsQuery = useStudentGroupsQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {groupsQuery.isLoading ? <StudentGroupListLoadingState /> : null}

        {groupsQuery.isError ? (
          <StudentGroupListErrorState
            onRetry={() => void groupsQuery.refetch()}
          />
        ) : null}

        {groupsQuery.isSuccess ? (
          <DataTable
            title="Student Group List"
            description={
              groupsQuery.data.meta.source === 'placeholder'
                ? 'Manage student groups and members. Currently using placeholder data until the API is connected.'
                : 'Manage student groups and members.'
            }
            totalLabel="groups"
            columns={studentGroupListColumns}
            data={groupsQuery.data.data}
            searchPlaceholder="Search by group, member, branch..."
            globalFilterFn={filterStudentGroup}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No student groups found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={groupsQuery.isFetching}
                  onClick={() => {
                    void groupsQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Student groups refreshed',
                        description: 'Latest placeholder data has been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${groupsQuery.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() =>
                    void navigate({ to: '/student-groups/new' })
                  }
                >
                  <Plus className="size-4" />
                  Add New Student Group
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
