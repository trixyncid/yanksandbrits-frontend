import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { predictionTestQueryKeys } from '../api/prediction-test-query-keys'
import { usePredictionTestsStore } from '../store/prediction-tests-store'
import type { PredictionTestListItem } from '../types/prediction-test'

export function PredictionTestActionsCell({
  test,
}: {
  test: PredictionTestListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const removeTest = usePredictionTestsStore((state) => state.remove)

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`Edit prediction test for ${test.studentName}`}
        onClick={() =>
          void navigate({
            to: '/prediction-tests/$testId/edit',
            params: { testId: test.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label={`Delete prediction test for ${test.studentName}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete prediction test?',
            description: `This will permanently remove ${test.studentName}. This action cannot be undone.`,
            onConfirm: () => {
              removeTest(test.id)
              void queryClient.invalidateQueries({
                queryKey: predictionTestQueryKeys.all,
              })
              notify('success', {
                title: 'Prediction test deleted',
                description: `${test.studentName} has been removed.`,
              })
            },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}
