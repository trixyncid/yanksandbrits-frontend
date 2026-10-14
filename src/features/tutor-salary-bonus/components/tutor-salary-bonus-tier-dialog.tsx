import { Wallet } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { PageBackdrop } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { notify } from '../../../shared/lib/notify'
import {
  createTutorSalaryBonusTier,
  employmentTypeLabels,
  tierToFormValues,
  updateTutorSalaryBonusTier,
  type EmploymentType,
  type PeriodWeeks,
  type TutorSalaryBonusTier,
  type TutorSalaryBonusTierFormValues,
  type WorkingDaysPerWeek,
} from '../api/tutor-salary-bonus-api'

type TutorSalaryBonusTierDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employmentType: EmploymentType
  workingDaysPerWeek: WorkingDaysPerWeek
  periodWeeks: PeriodWeeks
  tier: TutorSalaryBonusTier | null
}

export function TutorSalaryBonusTierDialog({
  open,
  onOpenChange,
  employmentType,
  workingDaysPerWeek,
  periodWeeks,
  tier,
}: TutorSalaryBonusTierDialogProps) {
  const queryClient = useQueryClient()
  const isUpdate = tier != null
  const [values, setValues] = useState<TutorSalaryBonusTierFormValues>(
    tierToFormValues(null),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    setValues(tierToFormValues(tier))
    setIsSubmitting(false)
  }, [open, tier])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }
    if (!values.minSessions.trim()) {
      notify('error', {
        title: 'Min sessions required',
        description: 'Enter the minimum session count for this tier.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        employmentType,
        workingDaysPerWeek,
        periodWeeks,
        ...values,
      }
      if (isUpdate && tier) {
        await updateTutorSalaryBonusTier(tier.id, payload)
      } else {
        await createTutorSalaryBonusTier(payload)
      }
      await queryClient.invalidateQueries({
        queryKey: ['tutor-salary-bonus-tiers'],
      })
      notify('success', {
        title: isUpdate ? 'Bonus tier updated' : 'Bonus tier added',
        description: `${employmentTypeLabels[employmentType]} · ${workingDaysPerWeek} days · ${periodWeeks} weeks.`,
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', {
        title: isUpdate
          ? 'Unable to update bonus tier'
          : 'Unable to add bonus tier',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="overflow-hidden p-0 sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate>
          <div className="relative isolate overflow-hidden px-6 pt-6 pb-5 text-white">
            <PageBackdrop theme="dusk" pattern="ribbons" />
            <div className="relative">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-white text-brand-600">
              <Wallet className="size-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle className="text-white">
                {isUpdate ? 'Edit bonus bracket' : 'Add bonus bracket'}
              </DialogTitle>
              <DialogDescription className="text-white/80">
                {employmentTypeLabels[employmentType]} tutors ·{' '}
                {workingDaysPerWeek} working days/week · {periodWeeks}-week
                period.
              </DialogDescription>
            </DialogHeader>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bonus-min-sessions">
                  Min sessions<span className="text-rose-500"> *</span>
                </Label>
                <Input
                  id="bonus-min-sessions"
                  inputMode="numeric"
                  value={values.minSessions}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      minSessions: event.target.value,
                    }))
                  }
                  placeholder="e.g. 8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus-max-sessions">Max sessions</Label>
                <Input
                  id="bonus-max-sessions"
                  inputMode="numeric"
                  value={values.maxSessions}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      maxSessions: event.target.value,
                    }))
                  }
                  placeholder="Blank = no max"
                />
                <p className="text-xs text-slate-500">
                  Leave empty for the top bracket.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonus-amount">Bonus amount (IDR)</Label>
              <Input
                id="bonus-amount"
                inputMode="numeric"
                value={values.bonusAmount}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    bonusAmount: event.target.value,
                  }))
                }
                placeholder="e.g. 250000"
              />
              <p className="text-xs text-slate-500">
                Paid on top of salary when the tutor's sessions fall in this
                range.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-0 bg-canvas px-6 py-4">
            <Button
              type="button"
              variant="soft"
              className="bg-white"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              <Wallet className="size-3.5" />
              {isSubmitting
                ? 'Saving...'
                : isUpdate
                  ? 'Save changes'
                  : 'Add bracket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
