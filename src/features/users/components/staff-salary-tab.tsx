import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Eye, Plus, RefreshCw, Trash2, Wallet } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
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
import { MarketingBonusSection } from './marketing-bonus-section'
import { MarketingCommissionSection } from './marketing-commission-section'
import { MarketingSalaryDialog } from './marketing-salary-dialog'
import {
  formatStaffCurrency,
  StaffDetailItem,
} from './staff-detail-utils'
import { TutorProgramSalaryDialog } from './tutor-program-salary-dialog'
import { TutorWorkingScheduleDialog } from './tutor-working-schedule-dialog'

type StaffSalaryTabProps = {
  user: UserDetail
}

export function StaffSalaryTab({ user }: StaffSalaryTabProps) {
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
      title: 'Remove program rate?',
      description: `${row.programTitle ?? 'This program'} will use ${user.fullName}'s base rates instead. This cannot be undone.`,
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
  if (!user.isTutor && !user.isMarketing) {
    return (
      <EmptySalaryState
        title="No salary profile"
        description="Salary details are available for tutor and marketing accounts."
      />
    )
  }

  const isLoading =
    (user.isTutor &&
      (tutorBaseQuery.isLoading || tutorProgramQuery.isLoading)) ||
    (user.isMarketing && marketingQuery.isLoading)

  if (isLoading) {
    return (
      <p className="px-6 py-12 text-center text-sm text-slate-500">
        Loading salary details...
      </p>
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
      <div className="space-y-8 p-6 sm:p-8">
        {user.isTutor ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Tutor salary
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Base rates apply to all programs unless an override is added
                  below.
                </p>
              </div>
              <Can module="users" action="change">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setTutorDialogOpen(true)}
                >
                  <Wallet className="size-3.5" />
                  {tutorSchedule ? 'Update salary' : 'Record salary'}
                </Button>
              </Can>
            </div>
            {tutorSchedule ? (
              <dl className="grid gap-4 sm:grid-cols-3">
                <StaffDetailItem
                  label="Main salary"
                  value={formatStaffCurrency(tutorSchedule.mainSalary)}
                />
                <StaffDetailItem
                  label="Per session"
                  value={formatStaffCurrency(tutorSchedule.salaryPerSession)}
                />
                <StaffDetailItem
                  label="Overtime multiplier"
                  value={`${tutorSchedule.overtimeMultiplier}x`}
                />
              </dl>
            ) : (
              <p className="text-sm text-slate-500">
                No base tutor salary on file yet. Record salary when ready.
              </p>
            )}

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h5 className="text-sm font-bold text-slate-900">
                    Program overrides
                  </h5>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Add a program only when this tutor is paid differently from
                    the base rates.
                  </p>
                </div>
                <Can module="users" action="change">
                  <Button
                    type="button"
                    variant="secondary"
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

              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                    <tr>
                      <th className="px-4 py-3">Program</th>
                      <th className="px-4 py-3">Per session</th>
                      <th className="px-4 py-3">Overtime</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programSalaries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-slate-500"
                        >
                          No program overrides. All programs use base rates.
                        </td>
                      </tr>
                    ) : (
                      programSalaries.map((row) => (
                        <tr key={row.id} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {row.programTitle || '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 tabular-nums">
                            {formatStaffCurrency(row.salaryPerSession)}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {row.overtimeMultiplier}x
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Can module="users" action="change">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProgramSalary(row)
                                    setProgramDialogOpen(true)
                                  }}
                                >
                                  <Eye className="size-3.5" />
                                  Details
                                </Button>
                              </Can>
                              <Can module="users" action="delete">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  className="text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                                  aria-label={`Delete program rate for ${row.programTitle ?? 'program'}`}
                                  onClick={() =>
                                    requestDeleteProgramSalary(row)
                                  }
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
            </div>
          </section>
        ) : null}

        {user.isMarketing ? (
          <section className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Marketing salary
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Base salary for this marketer.
                  </p>
                </div>
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
              </div>
              {marketingSalary ? (
                <StaffDetailItem
                  label="Main salary"
                  value={formatStaffCurrency(marketingSalary.mainSalary)}
                />
              ) : (
                <p className="text-sm text-slate-500">
                  No marketing salary record on file.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Commissions
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Commission percentage per payment amount range. The 4-week or
                  5-week set is picked automatically from the length of the
                  payroll period.
                </p>
              </div>
              {marketingSalary ? (
                <MarketingCommissionSection
                  salary={marketingSalary}
                  marketingName={user.fullName}
                />
              ) : (
                <p className="text-sm text-slate-500">
                  Record a marketing salary first to configure commissions.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Bonuses
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Flat IDR bonus per payment amount range. The 4-week or 5-week
                  set is picked automatically from the length of the payroll
                  period.
                </p>
              </div>
              {marketingSalary ? (
                <MarketingBonusSection
                  salary={marketingSalary}
                  marketingName={user.fullName}
                />
              ) : (
                <p className="text-sm text-slate-500">
                  Record a marketing salary first to configure bonuses.
                </p>
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
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1]">
        <Wallet className="size-5" />
      </div>
      <h4 className="mt-4 text-base font-bold text-slate-900">{title}</h4>
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
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertCircle className="size-5" />
      </div>
      <h4 className="mt-4 text-base font-bold text-slate-900">
        Unable to load salary details
      </h4>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      <Button className="mt-6" size="sm" onClick={onRetry}>
        <RefreshCw className="size-3.5" />
        Retry
      </Button>
    </div>
  )
}
