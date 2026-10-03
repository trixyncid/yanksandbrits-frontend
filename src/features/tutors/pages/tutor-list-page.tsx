import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import { tutorListColumns } from '../components/tutor-list-columns'
import {
  TutorListErrorState,
  TutorListLoadingState,
} from '../components/tutor-list-states'
import { useTutorsQuery } from '../hooks/use-tutors-query'
import type { TutorListItem } from '../types/tutor'

function filterTutor(row: TutorListItem, search: string) {
  const haystack = [
    row.pin,
    row.fullName,
    row.email,
    row.phone,
    row.gender,
    row.isActive ? 'active' : 'inactive',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function TutorListPage() {
  const navigate = useNavigate()
  const tutorsQuery = useTutorsQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {tutorsQuery.isLoading ? <TutorListLoadingState /> : null}

        {tutorsQuery.isError ? (
          <TutorListErrorState onRetry={() => void tutorsQuery.refetch()} />
        ) : null}

        {tutorsQuery.isSuccess ? (
          <DataTable
            title="Tutor List"
            description="Manage tutor profiles and working schedules."
            totalLabel="tutors"
            columns={tutorListColumns}
            data={tutorsQuery.data.data}
            searchPlaceholder="Search by pin, name, email, phone..."
            globalFilterFn={filterTutor}
            initialPageSize={10}
            emptyMessage="No tutors found"
            toolbarActions={
              <Can module="users" action="add">
                <Button onClick={() => void navigate({ to: '/tutors/new' })}>
                  <Plus className="size-4" />
                  Add New Tutor
                </Button>
              </Can>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
