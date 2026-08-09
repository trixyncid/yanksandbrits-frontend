import { useQuery } from '@tanstack/react-query'
import { Eye, Wallet } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../shared/components/ui/button'
import {
  fetchMarketingSalary,
  fetchTutorProgramSalaries,
  fetchTutorWorkingSchedule,
  type TutorProgramSalary,
} from '../api/compensation-api'
import type { UserDetail } from '../api/users-api'
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
  const [tutorDialogOpen, setTutorDialogOpen] = useState(false)
  const [marketingDialogOpen, setMarketingDialogOpen] = useState(false)
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

  const tutorSchedule = tutorBaseQuery.data ?? null
  const marketingSalary = marketingQuery.data ?? null
  const programSalaries = tutorProgramQuery.data ?? []

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
                  Base rates from the tutor working schedule.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTutorDialogOpen(true)}
              >
                <Wallet className="size-3.5" />
                {tutorSchedule ? 'Update salary' : 'Record salary'}
              </Button>
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
                No base tutor salary schedule on file.
              </p>
            )}

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
                        No program-specific salary rates.
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
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedProgramSalary(row)}
                          >
                            <Eye className="size-3.5" />
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {user.isMarketing ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Marketing salary
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Base salary and bonus tiers for this marketer.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setMarketingDialogOpen(true)}
              >
                <Wallet className="size-3.5" />
                {marketingSalary ? 'Update salary' : 'Record salary'}
              </Button>
            </div>
            {marketingSalary ? (
              <>
                <StaffDetailItem
                  label="Main salary"
                  value={formatStaffCurrency(marketingSalary.mainSalary)}
                />
                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                      <tr>
                        <th className="px-4 py-3">Min amount</th>
                        <th className="px-4 py-3">Max amount</th>
                        <th className="px-4 py-3">Bonus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketingSalary.bonusTiers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-8 text-center text-slate-500"
                          >
                            No bonus tiers configured.
                          </td>
                        </tr>
                      ) : (
                        marketingSalary.bonusTiers.map((tier) => (
                          <tr
                            key={tier.id}
                            className="border-t border-slate-100"
                          >
                            <td className="px-4 py-3 tabular-nums text-slate-600">
                              {formatStaffCurrency(tier.minAmount)}
                            </td>
                            <td className="px-4 py-3 tabular-nums text-slate-600">
                              {formatStaffCurrency(tier.maxAmount)}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {tier.percentage}%
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No marketing salary record on file.
              </p>
            )}
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
            open={selectedProgramSalary != null}
            onOpenChange={(open) => {
              if (!open) setSelectedProgramSalary(null)
            }}
            tutorName={user.fullName}
            salary={selectedProgramSalary}
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
      <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9]">
        <Wallet className="size-5" />
      </div>
      <h4 className="mt-4 text-base font-bold text-slate-900">{title}</h4>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
    </div>
  )
}
