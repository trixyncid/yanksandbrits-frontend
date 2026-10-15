import { useQueryClient } from '@tanstack/react-query'
import { Eye, FileText, Trash2, Users } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { deleteBookkeeping } from '../api/bookkeeping-api'
import { bookkeepingQueryKeys } from '../api/bookkeeping-query-keys'
import { formatPeriodDate } from '../lib/bookkeeping-status'
import type { BookkeepingListItem } from '../types/bookkeeping'

export function BookkeepingActionsCell({ item }: { item: BookkeepingListItem }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const periodName =
    item.title.trim() ||
    `${formatPeriodDate(item.startDate)} – ${formatPeriodDate(item.endDate)}`

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        aria-label={`Open period ${periodName}`}
        title="Open period"
        onClick={() =>
          void navigate({
            to: '/bookkeeping/$bookkeepingId',
            params: { bookkeepingId: item.id },
          })
        }
        className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
      >
        <Eye className="size-3.5" />
      </button>
      <Link
        to="/tutor-report"
        aria-label="Open tutor salary report"
        title="Tutor salary report"
        className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
      >
        <FileText className="size-3.5" />
      </Link>
      <Link
        to="/marketing-report"
        aria-label="Open education counsellor salary report"
        title="Education counsellor salary report"
        className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
      >
        <Users className="size-3.5" />
      </Link>
      <button
        type="button"
        aria-label={`Delete period ${periodName}`}
        title="Delete period"
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete bookkeeping period?',
            description: `This will permanently remove ${periodName} and its salary calculations. This cannot be undone.`,
            onConfirm: () => {
              void (async () => {
                try {
                  await deleteBookkeeping(item.id)
                  await queryClient.invalidateQueries({
                    queryKey: bookkeepingQueryKeys.all,
                  })
                  notify('success', {
                    title: 'Bookkeeping deleted',
                    description: `${periodName} has been removed.`,
                  })
                } catch (error) {
                  notify('error', {
                    title: 'Unable to delete bookkeeping',
                    description: getApiErrorMessage(error),
                  })
                }
              })()
            },
          })
        }
        className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-rose-500 transition hover:bg-rose-500 hover:text-white"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}
