import { useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeDollarSign, Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { fetchMarketingSalary } from '../../users/api/compensation-api'
import { MarketingSalaryDialog } from '../../users/components/marketing-salary-dialog'
import { RowActionButton } from '../../users/components/people-ui'
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
      <RowActionButton
        label={`View ${marketing.fullName}`}
        icon={Eye}
        onClick={() =>
          void navigate({
            to: '/marketings/$marketingId',
            params: { marketingId: marketing.id },
          })
        }
      />
      <Can module="users" action="change">
        <RowActionButton
          label={
            marketing.hasSalary
              ? `Edit base salary for ${marketing.fullName}`
              : `Set base salary for ${marketing.fullName}`
          }
          icon={BadgeDollarSign}
          tone="accent"
          onClick={() => {
            void queryClient
              .ensureQueryData({
                queryKey: ['marketing-salaries', marketing.id],
                queryFn: () => fetchMarketingSalary(marketing.id),
              })
              .then(() => setDialogOpen(true))
          }}
        />
      </Can>
      <Can module="users" action="delete">
        <RowActionButton
          label={`Delete ${marketing.fullName}`}
          icon={Trash2}
          tone="delete"
          onClick={() =>
            requestDeleteConfirm({
              title: `Delete ${marketing.fullName}?`,
              description: `This permanently removes education counsellor ${marketing.fullName} (${marketing.pin}) and their sign-in. This cannot be undone.`,
              onConfirm: () => {
                void (async () => {
                  try {
                    await deleteMarketing(marketing.id)
                    await queryClient.invalidateQueries({
                      queryKey: marketingQueryKeys.all,
                    })
                    notify('success', {
                      title: 'Education counsellor deleted',
                      description: `${marketing.fullName} has been removed.`,
                    })
                  } catch (error) {
                    notify('error', {
                      title: 'Unable to delete education counsellor',
                      description: getApiErrorMessage(error),
                    })
                  }
                })()
              },
            })
          }
        />
      </Can>

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
