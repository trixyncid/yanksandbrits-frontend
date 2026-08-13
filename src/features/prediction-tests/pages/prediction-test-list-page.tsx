import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { Select } from '../../../shared/components/ui/select'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import { useMarketingOptionsQuery } from '../../users/hooks/use-user-options'
import { predictionTestListColumns } from '../components/prediction-test-list-columns'
import {
  PredictionTestListErrorState,
  PredictionTestListLoadingState,
} from '../components/prediction-test-list-states'
import { usePredictionTestsQuery } from '../hooks/use-prediction-tests-query'
import type { PredictionTestListItem } from '../types/prediction-test'

function filterPredictionTest(row: PredictionTestListItem, search: string) {
  const haystack = [
    row.studentName,
    row.studentEmail,
    row.studentPhone,
    row.description,
    row.educationCounsellor,
    row.branch,
    row.status,
    String(row.amount),
    row.score == null ? '' : String(row.score),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function PredictionTestListPage() {
  const navigate = useNavigate()
  const [counsellorId, setCounsellorId] = useState('')
  const counsellorsQuery = useMarketingOptionsQuery()
  const testsQuery = usePredictionTestsQuery({
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
        {testsQuery.isLoading ? <PredictionTestListLoadingState /> : null}

        {testsQuery.isError ? (
          <div className="space-y-3">
            <div className="flex justify-end">{counsellorFilter}</div>
            <PredictionTestListErrorState
              onRetry={() => void testsQuery.refetch()}
            />
          </div>
        ) : null}

        {testsQuery.isSuccess ? (
          <DataTable
            title="Prediction Test List"
            description="Review prediction test results and payments."
            totalLabel="tests"
            columns={predictionTestListColumns}
            data={testsQuery.data.data}
            searchPlaceholder="Search by student, counsellor, status, branch..."
            globalFilterFn={filterPredictionTest}
            initialPageSize={10}
            emptyMessage="No prediction tests found"
            toolbarActions={
              <div className="flex items-center gap-2">
                {counsellorFilter}
                <Can module="predictionTests" action="add">
                  <Button
                    onClick={() => void navigate({ to: '/prediction-tests/new' })}
                  >
                    <Plus className="size-4" />
                    Add Prediction Test
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
