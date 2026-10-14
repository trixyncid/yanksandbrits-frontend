import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Eye,
  Lock,
  Plus,
  RefreshCw,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { PageBackdrop } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import {
  deleteTutorProgramSalary,
  fetchMarketingSalary,
  fetchTutorProgramSalaries,
  fetchTutorWorkingSchedule,
  type TutorProgramSalary,
} from '../api/compensation-api'
import type { UserDetail } from '../api/users-api'
import { isSystemAdminOnly, usesStaffSalary } from '../lib/staff-pay'
import { MarketingBonusSection } from './marketing-bonus-section'
import { StaffBaseSalarySection } from './staff-base-salary-section'
import { MarketingCommissionSection } from './marketing-commission-section'
import { MarketingSalaryDialog } from './marketing-salary-dialog'
import { formatStaffCurrency } from './staff-detail-utils'
import { TutorProgramSalaryDialog } from './tutor-program-salary-dialog'
import { TutorWorkingScheduleDialog } from './tutor-working-schedule-dialog'

type StaffSalaryTabProps = {
  user: UserDetail
}

export function StaffSalaryTab({ user }: StaffSalaryTabProps) {
  const isFreelance = user.employmentType === 'FL'
  const isBranchManager = user.roles.some(
    (role) => role.code === 'branch-manager',
  )
  const queryClient = useQueryClient()
  const [tutorDialogOpen, setTutorDialogOpen] = useState(false)
  const [marketingDialogOpen, setMarketingDialogOpen] = useState(false)
  const [programDialogOpen, setProgramDialogOpen] = useState(false)
  const [selectedProgramSalary, setSelectedProgramSalary] =
    useState<TutorProgramSalary | null>(null)

  const tutorBaseQuery = useQuery({
    queryKey: ['tutor-working-schedules', 'salary', user.id],
    queryFn: () => fetchTutorWorkingSchedule(user.id),
    enabled: user.isTutor,
  })

  const tutorProgramQuery = useQuery({
    queryKey: ['tutor-salary-class-based', user.id],
    queryFn: () => fetchTutorProgramSalaries(user.id),
    enabled: user.isTutor,
  })

  const marketingQuery = useQuery({
    queryKey: ['marketing-salaries', user.id],
    queryFn: () => fetchMarketingSalary(user.id),
    enabled: user.isMarketing,
  })

  function requestDeleteProgramSalary(row: TutorProgramSalary) {
    requestDeleteConfirm({
      title: `Remove the ${row.programTitle ?? 'program'} rate?`,
      description: `${row.programTitle ?? 'This program'} will go back to using ${user.fullName}'s base rates. This cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteTutorProgramSalary(row.id)
            await queryClient.invalidateQueries({
              queryKey: ['tutor-salary-class-based'],
            })
            notify('success', {
              title: 'Program salary removed',
              description: `${row.programTitle ?? 'Program'} will use the tutor's base rates.`,
            })
          } catch (error) {
            notify('error', {
              title: 'Unable to remove program salary',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }
  if (isSystemAdminOnly(user)) {
    return (
      <EmptySalaryState
        title="No salary for System Admin"
        description="The System Admin account is for the app's owner and developer, so it isn't paid through payroll."
      />
    )
  }

  if (usesStaffSalary(user)) {
    return <StaffBaseSalarySection user={user} />
  }

  if (!user.isTutor && !user.isMarketing) {
    return (
      <EmptySalaryState
        title="No pay details for this account"
        description="Give this person a role first. Their pay is set up from their role."
      />
    )
  }

  const isLoading =
    (user.isTutor &&
      (tutorBaseQuery.isLoading || tutorProgramQuery.isLoading)) ||
    (user.isMarketing && marketingQuery.isLoading)

  if (isLoading) {
    return (
      <div className="space-y-3 p-5 sm:p-6" aria-busy="true">
        <div className="h-36 animate-pulse rounded-3xl bg-canvas" />
        <div className="h-14 animate-pulse rounded-2xl bg-canvas/70" />
        <div className="h-14 animate-pulse rounded-2xl bg-canvas/70" />
      </div>
    )
  }

  const failedQuery = [tutorBaseQuery, tutorProgramQuery, marketingQuery].find(
    (query) => query.isError,
  )

  if (failedQuery) {
    return (
      <FailedSalaryState
        description={getApiErrorMessage(failedQuery.error)}
        onRetry={() => void failedQuery.refetch()}
      />
    )
  }

  const tutorSchedule = tutorBaseQuery.data ?? null
  const marketingSalary = marketingQuery.data ?? null
  const programSalaries = tutorProgramQuery.data ?? []
  const existingProgramIds = programSalaries
    .map((row) => row.programId)
    .filter((id): id is string => Boolean(id))

  return (
    <>
      <div className="space-y-6 p-5 sm:p-6">
        {user.isTutor ? (
          <section className="space-y-4">
            <PayHeadline
              title="Tutor pay"
              description={
                isFreelance
                  ? 'Freelance: paid per session only. No base salary, overtime, session bonus or paid leave.'
                  : 'Base rates used for every program unless a program rate is added below.'
              }
              figures={
                tutorSchedule && isFreelance
                  ? [
                      {
                        label: 'Per session',
                        value: formatStaffCurrency(tutorSchedule.salaryPerSession),
                        primary: true,
                      },
                    ]
                  : tutorSchedule
                  ? [
                      {
                        label: 'Main salary',
                        value: formatStaffCurrency(tutorSchedule.mainSalary),
                        primary: true,
                      },
                      {
                        label: 'Per session',
                        value: formatStaffCurrency(tutorSchedule.salaryPerSession),
                      },
                      {
                        label: 'Overtime',
                        value: `${tutorSchedule.overtimeMultiplier}x`,
                      },
                    ]
                  : null
              }
              emptyText="No base pay recorded yet."
              action={
                <Can module="users" action="change">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setTutorDialogOpen(true)}
                  >
                    <Wallet className="size-3.5" />
                    {tutorSchedule ? 'Update pay' : 'Record pay'}
                  </Button>
                </Can>
              }
            />

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h5 className="text-sm font-bold text-ink">Program rates</h5>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Only add a program when this tutor is paid differently for
                    it than their base rates.
                  </p>
                </div>
                <Can module="users" action="change">
                  <Button
                    type="button"
                    variant="soft"
                    size="sm"
                    onClick={() => {
                      setSelectedProgramSalary(null)
                      setProgramDialogOpen(true)
                    }}
                  >
                    <Plus className="size-3.5" />
                    Add program rate
                  </Button>
                </Can>
              </div>

              {programSalaries.length === 0 ? (
                <p className="rounded-2xl bg-canvas px-4 py-6 text-center text-sm text-slate-500">
                  No program rates. Every program uses the base rates above.
                </p>
              ) : (
                <ul className="space-y-2">
                  {programSalaries.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-wrap items-center gap-3 rounded-2xl bg-canvas px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {row.programTitle || '—'}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                          {formatStaffCurrency(row.salaryPerSession)} per
                          session · {row.overtimeMultiplier}x overtime
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Can module="users" action="change">
                          <button
                            type="button"
                            aria-label={`Open program rate for ${row.programTitle ?? 'program'}`}
                            title="Open details"
                            onClick={() => {
                              setSelectedProgramSalary(row)
                              setProgramDialogOpen(true)
                            }}
                            className="inline-flex size-9 items-center justify-center rounded-full bg-white text-ink transition hover:bg-ink hover:text-white"
                          >
                            <Eye className="size-3.5" />
                          </button>
                        </Can>
                        <Can module="users" action="delete">
                          <button
                            type="button"
                            aria-label={`Delete program rate for ${row.programTitle ?? 'program'}`}
                            title="Delete program rate"
                            onClick={() => requestDeleteProgramSalary(row)}
                            className="inline-flex size-9 items-center justify-center rounded-full bg-white text-rose-500 transition hover:bg-rose-500 hover:text-white"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </Can>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ) : null}

        {user.isMarketing ? (
          <section className="space-y-6">
            <PayHeadline
              title="Base salary"
              description="The fixed monthly amount before commission and bonuses."
              figures={
                marketingSalary
                  ? [
                      {
                        label: 'Main salary',
                        value: formatStaffCurrency(marketingSalary.mainSalary),
                        primary: true,
                      },
                    ]
                  : null
              }
              emptyText="No base salary recorded yet."
              action={
                <Can module="users" action="change">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setMarketingDialogOpen(true)}
                  >
                    <Wallet className="size-3.5" />
                    {marketingSalary ? 'Update salary' : 'Record salary'}
                  </Button>
                </Can>
              }
            />

            <div className="space-y-3">
              <div>
                <h4 className="text-base font-bold tracking-tight text-ink">
                  Commission
                </h4>
                <p className="mt-0.5 text-sm text-slate-500">
                  A percentage of each payment, based on its amount. The 4-week
                  or 5-week set is picked automatically from the length of the
                  payroll period.
                </p>
              </div>
              {marketingSalary ? (
                <MarketingCommissionSection
                  salary={marketingSalary}
                  marketingName={user.fullName}
                />
              ) : (
                <LockedNote>
                  Record a base salary first, then you can set commission.
                </LockedNote>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-base font-bold tracking-tight text-ink">
                  Bonuses
                </h4>
                <p className="mt-0.5 text-sm text-slate-500">
                  A flat IDR bonus for each payment amount range. The 4-week or
                  5-week set is picked automatically from the length of the
                  payroll period.
                </p>
                {isBranchManager ? (
                  <p className="mt-2 rounded-2xl bg-brand-50 px-3.5 py-2.5 text-xs text-brand-700">
                    Branch manager: this bonus is picked by the whole team's
                    range at their branch (commission stays on their own
                    payments). The top tier's max amount is the team range cap
                    for that period. Leave the top tier open-ended for no cap.
                  </p>
                ) : null}
              </div>
              {marketingSalary ? (
                <MarketingBonusSection
                  salary={marketingSalary}
                  marketingName={user.fullName}
                />
              ) : (
                <LockedNote>
                  Record a base salary first, then you can set bonuses.
                </LockedNote>
              )}
            </div>
          </section>
        ) : null}
      </div>

      {user.isTutor ? (
        <>
          <TutorWorkingScheduleDialog
            open={tutorDialogOpen}
            onOpenChange={setTutorDialogOpen}
            tutorId={user.id}
            tutorName={user.fullName}
            schedule={tutorSchedule}
            mode="salary"
            freelance={user.employmentType === 'FL'}
          />
          <TutorProgramSalaryDialog
            open={programDialogOpen}
            onOpenChange={(open) => {
              setProgramDialogOpen(open)
              if (!open) setSelectedProgramSalary(null)
            }}
            tutorId={user.id}
            tutorName={user.fullName}
            salary={selectedProgramSalary}
            existingProgramIds={existingProgramIds}
          />
        </>
      ) : null}

      {user.isMarketing ? (
        <MarketingSalaryDialog
          open={marketingDialogOpen}
          onOpenChange={setMarketingDialogOpen}
          marketingId={user.id}
          marketingName={user.fullName}
          salary={marketingSalary}
        />
      ) : null}
    </>
  )
}

function EmptySalaryState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="relative inline-flex size-16 items-center justify-center">
        <span aria-hidden className="absolute inset-0 rounded-full bg-brand-50" />
        <span aria-hidden className="absolute inset-2 rounded-full bg-brand-100" />
        <Wallet className="relative size-6 text-brand-600" strokeWidth={1.7} />
      </span>
      <h4 className="mt-4 text-base font-bold text-ink">{title}</h4>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  )
}

function FailedSalaryState({
  description,
  onRetry,
}: {
  description: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="inline-flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <AlertCircle className="size-6" />
      </div>
      <h4 className="mt-4 text-base font-bold text-ink">
        Unable to load salary details
      </h4>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      <Button className="mt-5" variant="ink" onClick={onRetry}>
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  )
}

function LockedNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 rounded-2xl bg-canvas px-4 py-3 text-sm text-slate-500">
      <Lock className="size-3.5 shrink-0 text-slate-400" />
      {children}
    </p>
  )
}

/** Money-forward dark card for the headline pay figures. */
function PayHeadline({
  title,
  description,
  figures,
  emptyText,
  action,
}: {
  title: string
  description: string
  figures: { label: string; value: string; primary?: boolean }[] | null
  emptyText: string
  action: ReactNode
}) {
  const primary = figures?.find((figure) => figure.primary)
  const rest = figures?.filter((figure) => !figure.primary) ?? []

  return (
    <div className="relative isolate overflow-hidden rounded-3xl p-5 text-white">
      <PageBackdrop theme="dusk" pattern="grid" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-bold tracking-tight">{title}</p>
            <p className="mt-0.5 max-w-md text-xs text-white/70">
              {description}
            </p>
          </div>
          {action}
        </div>
        {figures ? (
          <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">
            {primary ? (
              <div>
                <p className="text-xs font-medium text-white/60">
                  {primary.label}
                </p>
                <p className="mt-0.5 text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
                  {primary.value}
                </p>
              </div>
            ) : null}
            {rest.map((figure) => (
              <div key={figure.label} className="rounded-2xl bg-white/10 px-3.5 py-2">
                <p className="text-[11px] font-medium text-white/60">
                  {figure.label}
                </p>
                <p className="text-sm font-semibold tabular-nums">
                  {figure.value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm font-medium text-white/80">{emptyText}</p>
        )}
      </div>
    </div>
  )
}
