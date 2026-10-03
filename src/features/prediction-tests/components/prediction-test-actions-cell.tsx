import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { useInvalidateNavBadges } from '../../admin/hooks/use-nav-badges-query'
import { Can } from '../../auth/components/can'
import { deletePredictionTest } from '../api/prediction-tests-api'
import { predictionTestQueryKeys } from '../api/prediction-test-query-keys'
import type { PredictionTestListItem } from '../types/prediction-test'

export function PredictionTestActionsCell({
  test,
}: {
  test: PredictionTestListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const invalidateNavBadges = useInvalidateNavBadges()

  return (
    <div className="flex items-center justify-center gap-2">
      <Can module="predictionTests" action="change">
        <button
          type="button"
          aria-label={`Edit prediction test for ${test.studentName}`}
          onClick={() =>
            void navigate({
              to: '/prediction-tests/$testId/edit',
              params: { testId: test.id },
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-[#C8D4F5] hover:bg-[#F5F8FF] hover:text-[#1B2A5A]"
        >
          <Pencil className="size-3.5" />
        </button>
      </Can>
      <Can module="predictionTests" action="delete">
        <button
        type="button"
        aria-label={`Delete prediction test for ${test.studentName}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete prediction test?',
            description: `This will permanently remove the prediction test for ${test.studentName}. This action cannot be undone.`,
            onConfirm: () => {
              void deletePredictionTest(test.id)
                .then(async () => {
                  await queryClient.invalidateQueries({
                    queryKey: predictionTestQueryKeys.all,
                  })
                  invalidateNavBadges()
                  notify('success', {
                    title: 'Prediction test deleted',
                    description: `Prediction test for ${test.studentName} has been removed.`,
                  })
                })
                .catch((error) => {
                  notify('error', {
                    title: 'Unable to delete prediction test',
                    description: getApiErrorMessage(error),
                  })
                })
            },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-rose-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50"
      >
        <Trash2 className="size-3.5" />
        </button>
      </Can>
    </div>
  )
}
