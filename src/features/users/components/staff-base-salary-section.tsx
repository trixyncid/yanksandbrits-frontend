import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Wallet } from 'lucide-react'
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

/** Base salary for staff paid a fixed amount (Finance, CRO, Academic Leader, …). */
export function StaffBaseSalarySection({ user }: { user: UserDetail }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const isAcademicLeader = user.roles.some((role) => role.code === 'academic-leader')
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
    mutationFn: () => saveStaffSalary(user.id, Number(amount) || 0, salary?.id),
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ['staff-salaries', user.id] })
      setOpen(false)
      notify('success', {
        title: 'Base salary saved',
        description: `${user.fullName} is paid ${formatCurrencyAmount(saved.mainSalary)} each period.`,
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
              {salary ? 'Update base salary' : 'Set base salary'}
            </Button>
          </Can>
        </div>
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
              <DialogTitle>{salary ? 'Update base salary' : 'Set base salary'}</DialogTitle>
              <DialogDescription>
                The fixed amount {user.fullName} is paid each bookkeeping period.
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
            <DialogFooter>
              <Button type="button" variant="soft" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending || !amount}>
                {saveMutation.isPending ? 'Saving...' : 'Save base salary'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
