import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { Select } from '../../../shared/components/ui/select'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import { useMarketingOptionsQuery } from '../../users/hooks/use-user-options'
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
  const [counsellorId, setCounsellorId] = useState('')
  const counsellorsQuery = useMarketingOptionsQuery()
  const studentsQuery = useProspectiveStudentsQuery({
    counsellorId: counsellorId || undefined,
  })

  const counsellorFilter = (
    <Select
      value={counsellorId}
      onChange={(event) => setCounsellorId(event.target.value)}
      containerClassName="w-[240px]"
    >
      <option value="">All counsellors</option>
      {(counsellorsQuery.data ?? []).map((option) => (
        <option key={option.id} value={option.id}>
          {option.pin} | {option.fullName}
        </option>
      ))}
    </Select>
  )

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {studentsQuery.isLoading ? <ProspectiveStudentListLoadingState /> : null}

        {studentsQuery.isError ? (
          <div className="space-y-3">
            <div className="flex justify-end">{counsellorFilter}</div>
            <ProspectiveStudentListErrorState
              onRetry={() => void studentsQuery.refetch()}
            />
          </div>
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
              <div className="flex items-center gap-2">
                {counsellorFilter}
                <Can module="prospectiveStudents" action="add">
                  <Button
                    onClick={() =>
                      void navigate({ to: '/prospective-students/new' })
                    }
                  >
                    <Plus className="size-4" />
                    Add Prospective Student
                  </Button>
                </Can>
              </div>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
