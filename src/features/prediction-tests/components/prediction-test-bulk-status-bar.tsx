import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import type { DataTableSelectionContext } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { Select } from '../../../shared/components/ui/select'
import { notify } from '../../../shared/lib/notify'
import { useInvalidateNavBadges } from '../../admin/hooks/use-nav-badges-query'
import { bulkUpdatePredictionTestStatus } from '../api/prediction-tests-api'
import { predictionTestQueryKeys } from '../api/prediction-test-query-keys'
import type {
  PredictionTestListItem,
  PredictionTestStatus,
} from '../types/prediction-test'

const STATUS_OPTIONS: { value: PredictionTestStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'void', label: 'Void' },
]

export function PredictionTestBulkStatusBar({
  selectedRows,
  selectedCount,
  clearSelection,
}: DataTableSelectionContext<PredictionTestListItem>) {
  const queryClient = useQueryClient()
  const invalidateNavBadges = useInvalidateNavBadges()
  const [status, setStatus] = useState<PredictionTestStatus | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleApply() {
    if (!status || selectedCount === 0) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await bulkUpdatePredictionTestStatus(
        selectedRows.map((row) => row.id),
        status,
      )
      await queryClient.invalidateQueries({
        queryKey: predictionTestQueryKeys.all,
      })
      invalidateNavBadges()
      clearSelection()
      setStatus('')
      notify('success', {
        title: 'Status updated',
        description: `Updated ${result.updated} prediction test${result.updated === 1 ? '' : 's'} to ${STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status}.`,
      })
    } catch (error) {
      notify('error', {
        title: 'Unable to update status',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 bg-[#F5F8FF] px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-sm font-medium text-slate-700">
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#253CA1] px-1.5 py-0.5 text-[11px] font-bold text-white">
          {selectedCount}
        </span>{' '}
        selected for bulk update
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as PredictionTestStatus | '')
          }
          containerClassName="w-full sm:w-[180px]"
          className="rounded-full border-slate-200 bg-white shadow-sm"
          aria-label="Bulk status"
          disabled={isSubmitting}
        >
          <option value="">Set status…</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={!status || isSubmitting}
            onClick={() => void handleApply()}
          >
            {isSubmitting ? 'Updating…' : 'Apply'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={isSubmitting}
            onClick={clearSelection}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}
