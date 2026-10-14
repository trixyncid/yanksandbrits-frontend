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
          title="Edit prediction test"
          onClick={() =>
            void navigate({
              to: '/prediction-tests/$testId/edit',
              params: { testId: test.id },
            })
          }
          className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
        >
          <Pencil className="size-3.5" />
        </button>
      </Can>
      <Can module="predictionTests" action="delete">
        <button
          type="button"
          aria-label={`Delete prediction test for ${test.studentName}`}
          title="Delete prediction test"
          onClick={() =>
            requestDeleteConfirm({
              title: `Delete ${test.studentName}'s prediction test?`,
              description: `This permanently removes the prediction test for ${test.studentName}, including its scores, payment record and uploaded proofs. This cannot be undone.`,
              confirmLabel: 'Delete test',
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
          className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-rose-500 transition hover:bg-rose-500 hover:text-white"
        >
          <Trash2 className="size-3.5" />
        </button>
      </Can>
    </div>
  )
}
