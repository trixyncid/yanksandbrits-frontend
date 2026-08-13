import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
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
            description="Manage student groups and members."
            totalLabel="groups"
            columns={studentGroupListColumns}
            data={groupsQuery.data.data}
            searchPlaceholder="Search by group, member, branch..."
            globalFilterFn={filterStudentGroup}
            initialPageSize={10}
            emptyMessage="No student groups found"
            toolbarActions={
              <Can module="studentGroups" action="add">
                <Button
                  onClick={() => void navigate({ to: '/student-groups/new' })}
                >
                  <Plus className="size-4" />
                  Add New Student Group
                </Button>
              </Can>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
