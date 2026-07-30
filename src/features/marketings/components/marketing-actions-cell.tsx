import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { BadgeDollarSign, Eye, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { deleteMarketing } from '../api/marketings-api'
import { marketingQueryKeys } from '../api/marketing-query-keys'
import type { MarketingListItem } from '../types/marketing'

export function MarketingActionsCell({
  marketing,
}: {
  marketing: MarketingListItem
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={`View marketing ${marketing.fullName}`}
        onClick={() =>
          void navigate({
            to: '/marketings/$marketingId',
            params: { marketingId: marketing.id },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
      >
        <Eye className="size-3.5" />
      </button>
      {marketing.hasSalary ? (
        <button
          type="button"
          aria-label={`Edit salary for ${marketing.fullName}`}
          onClick={() =>
            notify('info', {
              title: 'Marketing salary',
              description: `${marketing.fullName} salary form will be added later.`,
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-amber-600 transition hover:border-amber-200 hover:bg-amber-50"
        >
          <BadgeDollarSign className="size-3.5" />
        </button>
      ) : null}
      <button
        type="button"
        aria-label={`Delete marketing ${marketing.fullName}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete marketing?',
            description: `This will permanently remove ${marketing.fullName}. This action cannot be undone.`,
            onConfirm: () => {
              void (async () => {
                try {
                  await deleteMarketing(marketing.id)
                  await queryClient.invalidateQueries({
                    queryKey: marketingQueryKeys.all,
                  })
                  notify('success', {
                    title: 'Marketing deleted',
                    description: `${marketing.fullName} has been removed.`,
                  })
                } catch (error) {
                  notify('error', {
                    title: 'Unable to delete marketing',
                    description: getApiErrorMessage(error),
                  })
                }
              })()
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
