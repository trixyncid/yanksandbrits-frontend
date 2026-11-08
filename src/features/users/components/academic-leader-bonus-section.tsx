import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import {
  academicLeaderBonusQueryKeys,
  deleteAcademicLeaderBonusTier,
  describeTutorHeadcount,
  fetchAcademicLeaderBonusTiers,
  type AcademicLeaderBonusTier,
} from '../api/compensation-api'
import { AcademicLeaderBonusTierDialog } from './academic-leader-bonus-tier-dialog'
import { formatStaffCurrency } from './staff-detail-utils'

/** `tier: null` adds a bracket; a tier edits it. */
type DialogTarget = { tier: AcademicLeaderBonusTier | null }

type AcademicLeaderBonusSectionProps = {
  leaderId: string
  leaderName: string
  /** Where the bonus is added: their staff base salary or their tutor pay. */
  paidOn: 'base salary' | 'tutor pay'
}

/** An academic leader's headcount bonus brackets (Salary tab). */
export function AcademicLeaderBonusSection({
  leaderId,
  leaderName,
  paidOn,
}: AcademicLeaderBonusSectionProps) {
  const queryClient = useQueryClient()
  const [dialogTarget, setDialogTarget] = useState<DialogTarget | null>(null)
  const tiersQuery = useQuery({
    queryKey: academicLeaderBonusQueryKeys.forLeader(leaderId),
    queryFn: () => fetchAcademicLeaderBonusTiers(leaderId),
  })
  const tiers = tiersQuery.data ?? []

  function handleDelete(tier: AcademicLeaderBonusTier) {
    requestDeleteConfirm({
      title: `Delete the ${describeTutorHeadcount(tier)} bracket?`,
      description: `This will remove it from ${leaderName}'s academic leader bonus. This cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteAcademicLeaderBonusTier(tier.id)
            await queryClient.invalidateQueries({
              queryKey: academicLeaderBonusQueryKeys.all,
            })
            notify('success', {
              title: 'Bonus bracket deleted',
              description: `The ${describeTutorHeadcount(tier)} bracket has been removed.`,
            })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete bracket',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  return (
    <section className="space-y-3 rounded-3xl bg-canvas p-3 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h5 className="text-sm font-bold text-ink">Academic leader bonus</h5>
          <p className="mt-0.5 text-xs text-slate-500">
            Paid on top of {paidOn}, by how many of {leaderName}’s tutors earned a
            session bonus in the period. Tutors count when they are in the same
            branch and teach one of {leaderName}’s subjects
            {paidOn === 'tutor pay' ? `; ${leaderName}’s own sessions don’t count` : ''}.
          </p>
        </div>
        <Can module="users" action="change">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDialogTarget({ tier: null })}
          >
            <Plus className="size-3.5" />
            Add bracket
          </Button>
        </Can>
      </div>

      {tiersQuery.isLoading ? (
        <div className="h-16 animate-pulse rounded-2xl bg-white" />
      ) : tiersQuery.isError ? (
        <p className="rounded-2xl bg-white px-4 py-5 text-center text-sm text-rose-600">
          {getApiErrorMessage(tiersQuery.error)}
        </p>
      ) : tiers.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-5 text-center text-sm text-slate-500">
          No bonus brackets yet, so no leader bonus is paid.
        </p>
      ) : (
        <ol className="space-y-1.5" aria-label="Bonus brackets, lowest to highest">
          {tiers.map((tier) => (
            <li
              key={tier.id}
              className="flex items-center gap-3 rounded-2xl bg-white px-3.5 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-500">
                  Tutors with a session bonus
                </p>
                <p className="truncate text-sm font-semibold text-ink tabular-nums">
                  {describeTutorHeadcount(tier)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-700 tabular-nums">
                {formatStaffCurrency(tier.bonusAmount)}
              </span>
              <div className="flex shrink-0 items-center gap-1.5">
                <Can module="users" action="change">
                  <button
                    type="button"
                    aria-label={`Update the ${describeTutorHeadcount(tier)} bracket`}
                    title="Edit bracket"
                    onClick={() => setDialogTarget({ tier })}
                    className="inline-flex size-8 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </Can>
                <Can module="users" action="change">
                  <button
                    type="button"
                    aria-label={`Delete the ${describeTutorHeadcount(tier)} bracket`}
                    title="Delete bracket"
                    onClick={() => handleDelete(tier)}
                    className="inline-flex size-8 items-center justify-center rounded-full bg-canvas text-rose-500 transition hover:bg-rose-500 hover:text-white"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </Can>
              </div>
            </li>
          ))}
        </ol>
      )}

      {dialogTarget ? (
        <AcademicLeaderBonusTierDialog
          key={dialogTarget.tier?.id ?? 'new'}
          open
          onOpenChange={(open) => {
            if (!open) setDialogTarget(null)
          }}
          leaderId={leaderId}
          leaderName={leaderName}
          tier={dialogTarget.tier}
        />
      ) : null}
    </section>
  )
}
