import { useNavigate } from '@tanstack/react-router'
import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { classroomListColumns } from '../components/classroom-list-columns'
import {
  ClassroomListErrorState,
  ClassroomListLoadingState,
} from '../components/classroom-list-states'
import { useClassroomsQuery } from '../hooks/use-classrooms-query'
import type { ClassroomListItem } from '../types/classroom'

function filterClassroom(row: ClassroomListItem, search: string) {
  const haystack = [
    row.code,
    row.className,
    row.branchName ?? '',
    row.isActive ? 'active' : 'inactive',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function ClassroomListPage() {
  const navigate = useNavigate()
  const classroomsQuery = useClassroomsQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {classroomsQuery.isLoading ? <ClassroomListLoadingState /> : null}

        {classroomsQuery.isError ? (
          <ClassroomListErrorState
            onRetry={() => void classroomsQuery.refetch()}
          />
        ) : null}

        {classroomsQuery.isSuccess ? (
          <DataTable
            title="Classroom List"
            description="Manage rooms available for class sessions."
            totalLabel="classrooms"
            columns={classroomListColumns}
            data={classroomsQuery.data.data}
            searchPlaceholder="Search by code, name, branch..."
            globalFilterFn={filterClassroom}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No classrooms found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={classroomsQuery.isFetching}
                  onClick={() => {
                    void classroomsQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Classrooms refreshed',
                        description: 'Latest classroom data has been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${classroomsQuery.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button
                  onClick={() => void navigate({ to: '/classrooms/new' })}
                >
                  <Plus className="size-4" />
                  Add New Classroom
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
