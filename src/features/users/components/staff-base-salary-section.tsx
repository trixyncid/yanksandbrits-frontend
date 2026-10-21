import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { GraduationCap, Wallet } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { CurrencyInput } from '../../../shared/components/ui/currency-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import { Label } from '../../../shared/components/ui/label'
import { formatCurrencyAmount } from '../../../shared/lib/currency'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { fetchStaffSalary, saveStaffSalary } from '../api/compensation-api'
import type { UserDetail } from '../api/users-api'
import { AcademicLeaderBonusSection } from './academic-leader-bonus-section'

type CommissionKind = 'finance' | 'cro' | 'digitalMarketing'

/** What a person's commission counts: Finance and CRO new students, Digital Marketing responses. */
function commissionScope(user: UserDetail, kind: CommissionKind) {
  if (kind === 'digitalMarketing') {
    return 'Counts consulted student responses from lead sources marked for Digital Marketing, in every branch.'
  }
  if (kind === 'finance') return 'Counts new students from every branch.'
  if (user.branchName) return `Counts new students in ${user.branchName} only.`
  return 'Counts new students in their own branch. Assign a branch first, or nothing is counted.'
}

/**
 * Base salary for staff paid a fixed amount (Finance, CRO, Academic Leader, …).
 * Finance and CRO also earn their own rate per new student; Digital Marketing
 * per student response.
 */
export function StaffBaseSalarySection({ user }: { user: UserDetail }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [commission, setCommission] = useState('')
  const isAcademicLeader = user.roles.some((role) => role.code === 'academic-leader')
  const hasRole = (code: string) => user.roles.some((role) => role.code === code)
  // Same precedence as the backend: Finance, then CRO, then Digital Marketing.
  const commissionKind: CommissionKind | null = hasRole('finance')
    ? 'finance'
    : hasRole('cro')
      ? 'cro'
      : hasRole('digital-marketing')
        ? 'digitalMarketing'
        : null
  const earnsCommission = commissionKind !== null
  const commissionUnit =
    commissionKind === 'digitalMarketing' ? 'student response' : 'new student'
  const roleNames = user.roles
    .filter((role) => role.code !== 'systemadmin')
    .map((role) => role.name)
    .join(', ')

  const salaryQuery = useQuery({
    queryKey: ['staff-salaries', user.id],
    queryFn: () => fetchStaffSalary(user.id),
  })
  const salary = salaryQuery.data ?? null

  const saveMutation = useMutation({
    mutationFn: () =>
      saveStaffSalary(
        user.id,
        {
          mainSalary: Number(amount) || 0,
          enrollmentCommission: earnsCommission ? Number(commission) || 0 : undefined,
        },
        salary?.id,
      ),
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ['staff-salaries', user.id] })
      setOpen(false)
      notify('success', {
        title: 'Pay saved',
        description: earnsCommission
          ? `${user.fullName} is paid ${formatCurrencyAmount(saved.mainSalary)} each period, plus ${formatCurrencyAmount(saved.enrollmentCommission)} per ${commissionUnit}.`
          : `${user.fullName} is paid ${formatCurrencyAmount(saved.mainSalary)} each period.`,
      })
    },
    onError: (error) =>
      notify('error', {
        title: 'Unable to save base salary',
        description: getApiErrorMessage(error),
      }),
  })

  function openDialog() {
    setAmount(salary ? String(salary.mainSalary) : '')
    setCommission(salary ? String(salary.enrollmentCommission) : '')
    setOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveMutation.mutate()
  }

  if (salaryQuery.isLoading) {
    return (
      <div className="p-5 sm:p-6" aria-busy="true">
        <div className="h-36 animate-pulse rounded-3xl bg-canvas" />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-5 sm:p-6">
      <section className="overflow-hidden rounded-3xl bg-ink p-5 text-white sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-white/60 uppercase">
              Base salary
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
              {salary ? formatCurrencyAmount(salary.mainSalary) : 'Not set yet'}
            </p>
            <p className="mt-1 text-sm text-white/70">
              {salary
                ? `Paid every bookkeeping period${roleNames ? ` as ${roleNames}` : ''}.`
                : 'Set a base salary so this person is included in payroll.'}
            </p>
          </div>
          <Can module="users" action="change">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-ink ring-0 hover:bg-brand-50"
              onClick={openDialog}
            >
              <Wallet className="size-3.5" />
              {salary ? 'Update pay' : 'Set pay'}
            </Button>
          </Can>
        </div>
        {commissionKind && salary ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-white/8 px-4 py-3">
            <GraduationCap aria-hidden className="mt-0.5 size-4 shrink-0 text-white/60" />
            <div>
              <p className="text-sm font-semibold">
                {salary.enrollmentCommission > 0
                  ? `${formatCurrencyAmount(salary.enrollmentCommission)} per ${commissionUnit}`
                  : 'No commission set'}
              </p>
              <p className="mt-0.5 text-xs text-white/60">
                {commissionScope(user, commissionKind)}
              </p>
            </div>
          </div>
        ) : null}
      </section>
      {isAcademicLeader ? (
        salary ? (
          <AcademicLeaderBonusSection
            leaderId={user.id}
            leaderName={user.fullName}
            paidOn="base salary"
          />
        ) : (
          <p className="text-xs text-slate-500">
            Set a base salary first, then add academic leader bonus brackets.
          </p>
        )
      ) : commissionKind ? (
        <p className="text-xs text-slate-500">
          Paid a fixed base salary plus their own commission for each {commissionUnit}{' '}
          counted in the bookkeeping period. {commissionScope(user, commissionKind)}
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          Staff in this role are paid a fixed base salary only, with no commission
          or session pay.
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <form onSubmit={handleSubmit} noValidate>
            <DialogHeader>
              <DialogTitle>{salary ? 'Update pay' : 'Set pay'}</DialogTitle>
              <DialogDescription>
                {earnsCommission
                  ? `What ${user.fullName} is paid each bookkeeping period, and per ${commissionUnit}.`
                  : `The fixed amount ${user.fullName} is paid each bookkeeping period.`}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 space-y-1.5">
              <Label htmlFor="staffBaseSalary">Base salary (IDR)</Label>
              <CurrencyInput
                id="staffBaseSalary"
                value={amount}
                onValueChange={setAmount}
                placeholder="0"
              />
            </div>
            {commissionKind ? (
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="staffEnrollmentCommission">
                  Commission per {commissionUnit} (IDR)
                </Label>
                <CurrencyInput
                  id="staffEnrollmentCommission"
                  value={commission}
                  onValueChange={setCommission}
                  placeholder="0"
                />
                <p className="text-xs text-slate-500">
                  {commissionScope(user, commissionKind)}
                </p>
              </div>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="soft" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending || !amount}>
                {saveMutation.isPending ? 'Saving...' : 'Save pay'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
