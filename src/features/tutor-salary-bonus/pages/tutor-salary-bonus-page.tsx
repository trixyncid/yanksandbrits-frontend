import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Layers, Pencil, Plus, Trash2, Trophy, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import {
  ListErrorState,
  ListLoadingState,
  PageHero,
} from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { cn } from '../../../shared/lib/cn'
import { notify } from '../../../shared/lib/notify'
import {
  formatCurrencyAmount,
  formatCurrencyCompact,
} from '../../../shared/lib/currency'
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
      title: 'Delete bonus bracket?',
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

  const allTiers = tiersQuery.data ?? []
  const loaded = tiersQuery.isSuccess
  const topBonus = visibleTiers.reduce(
    (max, tier) => Math.max(max, tier.bonusAmount),
    0,
  )
  const segmentClass = (active: boolean) =>
    cn(
      'h-9 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition',
      active ? 'bg-white text-ink shadow-sm' : 'text-white/80 hover:text-white',
    )

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <PageHero
          eyebrow="Money"
          title="Tutor salary bonus"
          description="Bonus brackets that reward tutors for the number of sessions they teach in a payroll period."
          theme="dusk"
          pattern="ribbons"
          stats={[
            {
              id: 'all',
              label: 'All brackets',
              value: loaded ? allTiers.length : '–',
              icon: Layers,
              caption: 'Across every tutor type',
            },
            {
              id: 'view',
              label: 'In this view',
              value: loaded ? visibleTiers.length : '–',
              icon: Users,
              caption: `${employmentTypeLabels[employmentType]} · ${workingDaysPerWeek} days/week`,
            },
            {
              id: 'top',
              label: 'Top bonus',
              value: loaded ? formatCurrencyCompact(topBonus) : '–',
              icon: Trophy,
              caption: 'Highest bracket in this view',
            },
          ]}
        >
          <div className="flex flex-wrap gap-2">
            <div
              role="radiogroup"
              aria-label="Employment type"
              className="inline-flex gap-1 rounded-full bg-white/15 p-1 backdrop-blur-md"
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={employmentType === type}
                  onClick={() => setEmploymentType(type)}
                  className={segmentClass(employmentType === type)}
                >
                  {employmentTypeLabels[type]}
                </button>
              ))}
            </div>
            <div
              role="radiogroup"
              aria-label="Working days per week"
              className="inline-flex gap-1 rounded-full bg-white/15 p-1 backdrop-blur-md"
            >
              {WORKING_DAYS.map((days) => (
                <button
                  key={days}
                  type="button"
                  role="radio"
                  aria-checked={workingDaysPerWeek === days}
                  onClick={() => setWorkingDaysPerWeek(days)}
                  className={segmentClass(workingDaysPerWeek === days)}
                >
                  {days} days / week
                </button>
              ))}
            </div>
          </div>
        </PageHero>

        {tiersQuery.isLoading ? <ListLoadingState rows={4} /> : null}

        {tiersQuery.isError ? (
          <ListErrorState
            title="Unable to load bonus brackets"
            description={getApiErrorMessage(tiersQuery.error)}
            onRetry={() => void tiersQuery.refetch()}
          />
        ) : null}

        {tiersQuery.isSuccess ? (
          <div className="grid items-start gap-3 lg:grid-cols-2">
            {PERIOD_WEEKS.map((periodWeeks, sectionIndex) => {
              const tiers = visibleTiers.filter(
                (tier) => tier.periodWeeks === periodWeeks,
              )
              const maxBonus = tiers.reduce(
                (max, tier) => Math.max(max, tier.bonusAmount),
                0,
              )

              return (
                <section
                  key={periodWeeks}
                  className={cn(
                    'animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] bg-white p-5 sm:p-6',
                    sectionIndex === 1 && 'delay-75',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex size-11 shrink-0 flex-col items-center justify-center rounded-2xl bg-ink text-white">
                        <span className="text-base leading-none font-bold">
                          {periodWeeks}
                        </span>
                        <span className="text-[9px] font-semibold tracking-wide uppercase opacity-75">
                          weeks
                        </span>
                      </span>
                      <div>
                        <h2 className="text-base font-bold text-ink">
                          {periodWeeks}-week period
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Used when a bookkeeping period works out to{' '}
                          {periodWeeks} weeks.
                        </p>
                      </div>
                    </div>
                    <Can module="tutorSalaryBonus" action="add">
                      <Button
                        variant="soft"
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

                  {tiers.length === 0 ? (
                    <div className="mt-4 rounded-3xl bg-canvas px-4 py-8 text-center">
                      <p className="text-sm font-semibold text-ink">
                        No bonus brackets yet
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {employmentTypeLabels[employmentType]} tutors on{' '}
                        {workingDaysPerWeek} days/week get no session bonus
                        for {periodWeeks}-week periods.
                      </p>
                    </div>
                  ) : (
                    <ol className="mt-4 space-y-2" aria-label="Bonus brackets, lowest to highest">
                      {tiers.map((tier, index) => (
                        <li
                          key={tier.id}
                          className="flex items-center gap-3 rounded-3xl bg-canvas py-2.5 pr-2.5 pl-3"
                        >
                          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-ink">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                              <p className="text-sm font-semibold text-ink tabular-nums">
                                {describeRange(tier)}
                              </p>
                              <p className="text-sm font-bold text-ink tabular-nums">
                                {formatCurrencyAmount(tier.bonusAmount)}
                              </p>
                            </div>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
                              <div
                                className="h-full rounded-full bg-brand-500"
                                style={{
                                  width: `${maxBonus > 0 ? Math.max(4, (tier.bonusAmount / maxBonus) * 100) : 0}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <Can module="tutorSalaryBonus" action="change">
                              <button
                                type="button"
                                aria-label={`Edit bracket ${describeRange(tier)}`}
                                title="Edit bracket"
                                onClick={() =>
                                  setDialogTarget({
                                    employmentType,
                                    workingDaysPerWeek,
                                    periodWeeks,
                                    tier,
                                  })
                                }
                                className="inline-flex size-9 items-center justify-center rounded-full bg-white text-ink transition hover:bg-ink hover:text-white"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                            </Can>
                            <Can module="tutorSalaryBonus" action="delete">
                              <button
                                type="button"
                                aria-label={`Delete bracket ${describeRange(tier)}`}
                                title="Delete bracket"
                                onClick={() => handleDelete(tier)}
                                className="inline-flex size-9 items-center justify-center rounded-full bg-white text-rose-500 transition hover:bg-rose-500 hover:text-white"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </Can>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
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
