import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { cn } from '../../../shared/lib/cn'
import { notify } from '../../../shared/lib/notify'
import { formatCurrencyAmount } from '../../../shared/lib/currency'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import {
  deleteTutorSalaryBonusTier,
  employmentTypeLabels,
  fetchTutorSalaryBonusTiers,
  type EmploymentType,
  type PeriodWeeks,
  type TutorSalaryBonusTier,
  type WorkingDaysPerWeek,
} from '../api/tutor-salary-bonus-api'
import { TutorSalaryBonusTierDialog } from '../components/tutor-salary-bonus-tier-dialog'

const EMPLOYMENT_TYPES: EmploymentType[] = ['FT', 'PT']
const WORKING_DAYS: WorkingDaysPerWeek[] = [5, 6]
const PERIOD_WEEKS: PeriodWeeks[] = [4, 5]

type DialogTarget = {
  employmentType: EmploymentType
  workingDaysPerWeek: WorkingDaysPerWeek
  periodWeeks: PeriodWeeks
  tier: TutorSalaryBonusTier | null
}

function describeRange(tier: TutorSalaryBonusTier) {
  if (tier.maxSessions == null) {
    return `≥ ${tier.minSessions} sessions`
  }
  return `${tier.minSessions} – ${tier.maxSessions} sessions`
}

export default function TutorSalaryBonusPage() {
  const queryClient = useQueryClient()
  const [employmentType, setEmploymentType] = useState<EmploymentType>('FT')
  const [workingDaysPerWeek, setWorkingDaysPerWeek] =
    useState<WorkingDaysPerWeek>(5)
  const [dialogTarget, setDialogTarget] = useState<DialogTarget | null>(null)

  const tiersQuery = useQuery({
    queryKey: ['tutor-salary-bonus-tiers'],
    queryFn: fetchTutorSalaryBonusTiers,
  })

  const visibleTiers = useMemo(() => {
    return (tiersQuery.data ?? [])
      .filter(
        (tier) =>
          tier.employmentType === employmentType &&
          tier.workingDaysPerWeek === workingDaysPerWeek,
      )
      .sort(
        (a, b) =>
          a.periodWeeks - b.periodWeeks || a.minSessions - b.minSessions,
      )
  }, [employmentType, tiersQuery.data, workingDaysPerWeek])

  function handleDelete(tier: TutorSalaryBonusTier) {
    requestDeleteConfirm({
      title: 'Delete bonus tier?',
      description: `This will remove the ${describeRange(tier)} bracket for ${employmentTypeLabels[tier.employmentType]} · ${tier.workingDaysPerWeek} days · ${tier.periodWeeks} weeks.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteTutorSalaryBonusTier(tier.id)
            await queryClient.invalidateQueries({
              queryKey: ['tutor-salary-bonus-tiers'],
            })
            notify('success', {
              title: 'Bonus tier deleted',
              description: `${describeRange(tier)} has been removed.`,
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
    <AdminShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Tutor Salary Bonus
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Global session-count bonus brackets by employment type, working
            days/week, and payroll period weeks.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {EMPLOYMENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setEmploymentType(type)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-semibold transition',
                employmentType === type
                  ? 'bg-[#253CA1] text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              {employmentTypeLabels[type]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {WORKING_DAYS.map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setWorkingDaysPerWeek(days)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-semibold transition',
                workingDaysPerWeek === days
                  ? 'bg-[#E8EEFF] text-[#1B2A5A] ring-1 ring-[#C8D4F5]'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
              )}
            >
              {days} working days / week
            </button>
          ))}
        </div>

        {tiersQuery.isLoading ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            Loading bonus tiers...
          </p>
        ) : null}

        {tiersQuery.isError ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-6 py-8 text-center">
            <p className="text-sm text-rose-700">
              {getApiErrorMessage(tiersQuery.error)}
            </p>
            <Button
              className="mt-4"
              size="sm"
              onClick={() => void tiersQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {tiersQuery.isSuccess ? (
          <div className="space-y-6">
            {PERIOD_WEEKS.map((periodWeeks) => {
              const tiers = visibleTiers.filter(
                (tier) => tier.periodWeeks === periodWeeks,
              )

              return (
                <section
                  key={periodWeeks}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {periodWeeks}-week period
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Matches bookkeeping windows that resolve to a{' '}
                        {periodWeeks}-week payroll period.
                      </p>
                    </div>
                    <Can module="tutorSalaryBonus" action="add">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setDialogTarget({
                            employmentType,
                            workingDaysPerWeek,
                            periodWeeks,
                            tier: null,
                          })
                        }
                      >
                        <Plus className="size-3.5" />
                        Add tier
                      </Button>
                    </Can>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-50 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                        <tr>
                          <th className="px-4 py-3">Min sessions</th>
                          <th className="px-4 py-3">Max sessions</th>
                          <th className="px-4 py-3">Bonus</th>
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
                              No bonus tiers for this combination yet.
                            </td>
                          </tr>
                        ) : (
                          tiers.map((tier) => (
                            <tr
                              key={tier.id}
                              className="border-t border-slate-100"
                            >
                              <td className="px-4 py-3 font-semibold tabular-nums text-slate-800">
                                {tier.minSessions}
                              </td>
                              <td className="px-4 py-3 tabular-nums text-slate-600">
                                {tier.maxSessions == null
                                  ? 'No max'
                                  : tier.maxSessions}
                              </td>
                              <td className="px-4 py-3 font-medium tabular-nums text-slate-700">
                                {formatCurrencyAmount(tier.bonusAmount)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <Can
                                    module="tutorSalaryBonus"
                                    action="change"
                                  >
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      onClick={() =>
                                        setDialogTarget({
                                          employmentType,
                                          workingDaysPerWeek,
                                          periodWeeks,
                                          tier,
                                        })
                                      }
                                    >
                                      <Pencil className="size-3.5" />
                                      Edit
                                    </Button>
                                  </Can>
                                  <Can
                                    module="tutorSalaryBonus"
                                    action="delete"
                                  >
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      className="text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                      onClick={() => handleDelete(tier)}
                                    >
                                      <Trash2 className="size-3.5" />
                                      Delete
                                    </Button>
                                  </Can>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )
            })}
          </div>
        ) : null}
      </div>

      {dialogTarget ? (
        <TutorSalaryBonusTierDialog
          open
          onOpenChange={(open) => {
            if (!open) setDialogTarget(null)
          }}
          employmentType={dialogTarget.employmentType}
          workingDaysPerWeek={dialogTarget.workingDaysPerWeek}
          periodWeeks={dialogTarget.periodWeeks}
          tier={dialogTarget.tier}
        />
      ) : null}
    </AdminShell>
  )
}
