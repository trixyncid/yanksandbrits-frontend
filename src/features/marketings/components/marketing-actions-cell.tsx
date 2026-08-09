import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeDollarSign, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { fetchMarketingSalary } from '../../users/api/compensation-api'
import { MarketingSalaryDialog } from '../../users/components/marketing-salary-dialog'
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
  const [dialogOpen, setDialogOpen] = useState(false)

  const salaryQuery = useQuery({
    queryKey: ['marketing-salaries', marketing.id],
    queryFn: () => fetchMarketingSalary(marketing.id),
    enabled: dialogOpen,
  })

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
      <button
        type="button"
        aria-label={
          marketing.hasSalary
            ? `Edit salary for ${marketing.fullName}`
            : `Record salary for ${marketing.fullName}`
        }
        onClick={() => {
          void queryClient
            .ensureQueryData({
              queryKey: ['marketing-salaries', marketing.id],
              queryFn: () => fetchMarketingSalary(marketing.id),
            })
            .then(() => setDialogOpen(true))
        }}
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-amber-600 transition hover:border-amber-200 hover:bg-amber-50"
      >
        <BadgeDollarSign className="size-3.5" />
      </button>
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

      <MarketingSalaryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        marketingId={marketing.id}
        marketingName={marketing.fullName}
        salary={salaryQuery.data ?? null}
      />
    </div>
  )
}
