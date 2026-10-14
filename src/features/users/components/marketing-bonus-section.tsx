import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import {
  COMMISSION_PERIOD_TYPES,
  commissionPeriodLabels,
  deleteMarketingBonusTier,
  type CommissionPeriodType,
  type MarketingBonusTier,
  type MarketingSalary,
} from '../api/compensation-api'
import { MarketingBonusTierDialog } from './marketing-bonus-tier-dialog'
import { formatStaffCurrency } from './staff-detail-utils'

type DialogTarget = {
  periodType: CommissionPeriodType
  tier: MarketingBonusTier | null
}

type MarketingBonusSectionProps = {
  salary: MarketingSalary
  marketingName: string
}

export function MarketingBonusSection({
  salary,
  marketingName,
}: MarketingBonusSectionProps) {
  const queryClient = useQueryClient()
  const [dialogTarget, setDialogTarget] = useState<DialogTarget | null>(null)

  function handleDelete(tier: MarketingBonusTier) {
    requestDeleteConfirm({
      title: `Delete the ${describeRange(tier)} bonus tier?`,
      description: `This will remove the ${describeRange(tier)} tier from ${marketingName}'s ${commissionPeriodLabels[tier.periodType].toLowerCase()} bonuses. This cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteMarketingBonusTier(tier.id)
            await queryClient.invalidateQueries({
              queryKey: ['marketing-salaries'],
            })
            notify('success', {
              title: 'Bonus tier deleted',
              description: `The ${describeRange(tier)} tier has been removed.`,
            })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete bonus tier',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  return (
    <>
      <div className="grid gap-3 xl:grid-cols-2">
        {COMMISSION_PERIOD_TYPES.map((periodType) => {
          const tiers = salary.bonusTiers
            .filter((tier) => tier.periodType === periodType)
            .sort((a, b) => a.minAmount - b.minAmount)

          return (
            <div key={periodType} className="space-y-3 rounded-3xl bg-canvas p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h5 className="text-sm font-bold text-ink">
                  {commissionPeriodLabels[periodType]}
                </h5>
                <Can module="users" action="change">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDialogTarget({ periodType, tier: null })}
                    aria-label={`Add a ${commissionPeriodLabels[periodType].toLowerCase()} bonus tier`}
                  >
                    <Plus className="size-3.5" />
                    Add tier
                  </Button>
                </Can>
              </div>

              {tiers.length === 0 ? (
                <p className="rounded-2xl bg-white px-4 py-5 text-center text-sm text-slate-500">
                  No bonus tiers for this period yet.
                </p>
              ) : (
                <ol className="space-y-1.5">
                  {tiers.map((tier) => (
                    <li
                      key={tier.id}
                      className="flex items-center gap-3 rounded-2xl bg-white px-3.5 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-slate-500">
                          Payment between
                        </p>
                        <p className="truncate text-sm font-semibold text-ink tabular-nums">
                          {formatStaffCurrency(tier.minAmount)}
                          <span className="text-slate-400"> – </span>
                          {tier.maxAmount == null
                            ? 'no limit'
                            : formatStaffCurrency(tier.maxAmount)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-700 tabular-nums">
                        {formatStaffCurrency(tier.bonusAmount)}
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Can module="users" action="change">
                          <button
                            type="button"
                            aria-label={`Update the ${describeRange(tier)} bonus tier`}
                            title="Edit tier"
                            onClick={() =>
                              setDialogTarget({
                                periodType,
                                tier,
                              })
                            }
                            className="inline-flex size-8 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                        </Can>
                        <Can module="users" action="change">
                          <button
                            type="button"
                            aria-label={`Delete the ${describeRange(tier)} bonus tier`}
                            title="Delete tier"
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
            </div>
          )
        })}
      </div>

      {dialogTarget ? (
        <MarketingBonusTierDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialogTarget(null)
          }}
          marketingSalaryId={salary.id}
          marketingName={marketingName}
          periodType={dialogTarget.periodType}
          tier={dialogTarget.tier}
        />
      ) : null}
    </>
  )
}

function describeRange(tier: MarketingBonusTier) {
  const min = formatStaffCurrency(tier.minAmount)
  return tier.maxAmount == null
    ? `${min} and above`
    : `${min} – ${formatStaffCurrency(tier.maxAmount)}`
}
