import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import { programListColumns } from '../components/program-list-columns'
import {
  ProgramListErrorState,
  ProgramListLoadingState,
} from '../components/program-list-states'
import { useProgramsQuery } from '../hooks/use-programs-query'
import type { ProgramListItem } from '../types/program'

function filterProgram(row: ProgramListItem, search: string) {
  const haystack = [
    row.code,
    row.title,
    row.description,
    row.isActive ? 'active' : 'inactive',
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function ProgramListPage() {
  const navigate = useNavigate()
  const programsQuery = useProgramsQuery()

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {programsQuery.isLoading ? <ProgramListLoadingState /> : null}

        {programsQuery.isError ? (
          <ProgramListErrorState
            onRetry={() => void programsQuery.refetch()}
          />
        ) : null}

        {programsQuery.isSuccess ? (
          <DataTable
            title="Program List"
            description="Manage academic programs and course packages."
            totalLabel="programs"
            columns={programListColumns}
            data={programsQuery.data.data}
            searchPlaceholder="Search by code, title, description..."
            globalFilterFn={filterProgram}
            initialPageSize={10}
            emptyMessage="No programs found"
            toolbarActions={
              <Can module="programs" action="add">
                <Button onClick={() => void navigate({ to: '/programs/new' })}>
                  <Plus className="size-4" />
                  Add New Program
                </Button>
              </Can>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
