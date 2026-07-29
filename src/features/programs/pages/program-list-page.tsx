import { useNavigate } from '@tanstack/react-router'
import { Plus, RefreshCw } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
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
            description={
              programsQuery.data.meta.source === 'placeholder'
                ? 'Manage academic programs and course packages. Currently using placeholder data until the API is connected.'
                : 'Manage academic programs and course packages.'
            }
            totalLabel="programs"
            columns={programListColumns}
            data={programsQuery.data.data}
            searchPlaceholder="Search by code, title, description..."
            globalFilterFn={filterProgram}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No programs found"
            toolbarActions={
              <>
                <Button
                  variant="secondary"
                  disabled={programsQuery.isFetching}
                  onClick={() => {
                    void programsQuery.refetch().then(() => {
                      notify('success', {
                        title: 'Programs refreshed',
                        description: 'Latest placeholder data has been loaded.',
                      })
                    })
                  }}
                >
                  <RefreshCw
                    className={`size-4 ${programsQuery.isFetching ? 'animate-spin' : ''}`}
                  />
                  Refresh
                </Button>
                <Button onClick={() => void navigate({ to: '/programs/new' })}>
                  <Plus className="size-4" />
                  Add New Program
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
