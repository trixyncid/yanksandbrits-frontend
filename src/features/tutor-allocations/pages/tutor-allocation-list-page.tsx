import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import { tutorAllocationListColumns } from '../components/tutor-allocation-list-columns'
import {
  TutorAllocationListErrorState,
  TutorAllocationListLoadingState,
} from '../components/tutor-allocation-list-states'
import { useTutorAllocationsQuery } from '../hooks/use-tutor-allocations-query'
import { programLabel } from '../lib/programs'
import type { TutorAllocationListItem } from '../types/tutor-allocation'

function filterAllocation(row: TutorAllocationListItem, search: string) {
  const haystack = [
    row.classType,
    row.branchName,
    row.program,
    programLabel(row.program),
    row.course ?? '',
    ...row.members.flatMap((member) => [member.studentName, member.pin, member.grn]),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(search)
}

export default function TutorAllocationListPage() {
  const navigate = useNavigate()
  const allocationsQuery = useTutorAllocationsQuery()

  function openCreate() {
    void navigate({ to: '/tutor-allocations/new' })
  }

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
              Tutor Allocation
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Open a class to review it. New classes stay hidden from academic
              leaders until a branch manager or system admin approves them.
            </p>
          </div>
          <Can module="tutorAllocations" action="add">
            <Button
              onClick={openCreate}
              className="rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800"
            >
              <Plus className="size-4" />
              Add Class
            </Button>
          </Can>
        </div>

        {allocationsQuery.isLoading ? <TutorAllocationListLoadingState /> : null}

        {allocationsQuery.isError ? (
          <TutorAllocationListErrorState
            onRetry={() => void allocationsQuery.refetch()}
          />
        ) : null}

        {allocationsQuery.isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              title="Allocations"
              description="Search and manage tutor allocation records."
              totalLabel="allocations"
              columns={tutorAllocationListColumns}
              data={allocationsQuery.data.data}
              searchPlaceholder="Search by student name..."
              searchVariant="pill"
              globalFilterFn={filterAllocation}
              initialPageSize={10}
              emptyMessage="No tutor allocations found"
            />
          </div>
        ) : null}
      </div>
    </AdminShell>
  )
}
