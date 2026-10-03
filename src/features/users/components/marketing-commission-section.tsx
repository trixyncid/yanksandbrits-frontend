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
  deleteMarketingCommissionTier,
  type CommissionPeriodType,
  type MarketingCommissionTier,
  type MarketingSalary,
} from '../api/compensation-api'
import { MarketingCommissionTierDialog } from './marketing-commission-tier-dialog'
import { formatStaffCurrency } from './staff-detail-utils'

type DialogTarget = {
  periodType: CommissionPeriodType
  tier: MarketingCommissionTier | null
}

type MarketingCommissionSectionProps = {
  salary: MarketingSalary
  marketingName: string
}

export function MarketingCommissionSection({
  salary,
  marketingName,
}: MarketingCommissionSectionProps) {
  const queryClient = useQueryClient()
  const [dialogTarget, setDialogTarget] = useState<DialogTarget | null>(null)

  function handleDelete(tier: MarketingCommissionTier) {
    requestDeleteConfirm({
      title: 'Delete commission tier?',
      description: `This will remove the ${describeRange(tier)} tier from ${marketingName}'s ${commissionPeriodLabels[tier.periodType].toLowerCase()} commissions. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteMarketingCommissionTier(tier.id)
            await queryClient.invalidateQueries({
              queryKey: ['marketing-salaries'],
            })
            notify('success', {
              title: 'Commission tier deleted',
              description: `The ${describeRange(tier)} tier has been removed.`,
            })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete commission tier',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  return (
    <>
      <div className="space-y-6">
        {COMMISSION_PERIOD_TYPES.map((periodType) => {
          const tiers = salary.commissionTiers
            .filter((tier) => tier.periodType === periodType)
            .sort((a, b) => a.minAmount - b.minAmount)

          return (
            <div key={periodType} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h5 className="text-sm font-bold text-slate-900">
                  {commissionPeriodLabels[periodType]}
                </h5>
                <Can module="users" action="change">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDialogTarget({ periodType, tier: null })}
                  >
                    <Plus className="size-3.5" />
                    Add tier
                  </Button>
                </Can>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                    <tr>
                      <th className="px-4 py-3">Min amount</th>
                      <th className="px-4 py-3">Max amount</th>
                      <th className="px-4 py-3">Commission</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-slate-500"
                        >
                          No commission tiers configured for this period.
                        </td>
                      </tr>
                    ) : (
                      tiers.map((tier) => (
                        <tr key={tier.id} className="border-t border-slate-100">
                          <td className="px-4 py-3 tabular-nums text-slate-600">
                            {formatStaffCurrency(tier.minAmount)}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-slate-600">
                            {tier.maxAmount == null
                              ? 'No limit'
                              : formatStaffCurrency(tier.maxAmount)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {tier.percentage}%
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Can module="users" action="change">
                                <button
                                  type="button"
                                  aria-label={`Update the ${describeRange(tier)} commission tier`}
                                  onClick={() =>
                                    setDialogTarget({
                                      periodType,
                                      tier,
                                    })
                                  }
                                  className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#C8D4F5] hover:bg-[#F5F8FF] hover:text-[#1B2A5A]"
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                              </Can>
                              <Can module="users" action="change">
                                <button
                                  type="button"
                                  aria-label={`Delete the ${describeRange(tier)} commission tier`}
                                  onClick={() => handleDelete(tier)}
                                  className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </Can>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      {dialogTarget ? (
        <MarketingCommissionTierDialog
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

function describeRange(tier: MarketingCommissionTier) {
  const min = formatStaffCurrency(tier.minAmount)
  return tier.maxAmount == null
    ? `${min} and above`
    : `${min} – ${formatStaffCurrency(tier.maxAmount)}`
}
