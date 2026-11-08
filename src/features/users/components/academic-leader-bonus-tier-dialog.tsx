import { useQueryClient } from '@tanstack/react-query'
import { Users } from 'lucide-react'
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
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { notify } from '../../../shared/lib/notify'
import {
  academicLeaderBonusQueryKeys,
  academicLeaderBonusTierToFormValues,
  createAcademicLeaderBonusTier,
  updateAcademicLeaderBonusTier,
  type AcademicLeaderBonusTier,
  type AcademicLeaderBonusTierFormValues,
} from '../api/compensation-api'

type AcademicLeaderBonusTierDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  leaderId: string
  leaderName: string
  tier: AcademicLeaderBonusTier | null
}

export function AcademicLeaderBonusTierDialog({
  open,
  onOpenChange,
  leaderId,
  leaderName,
  tier,
}: AcademicLeaderBonusTierDialogProps) {
  const queryClient = useQueryClient()
  const isUpdate = tier != null
  const [values, setValues] = useState<AcademicLeaderBonusTierFormValues>(
    academicLeaderBonusTierToFormValues(tier),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  function setField(field: keyof AcademicLeaderBonusTierFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }
    if (!(Number(values.minHeadcount) >= 1)) {
      notify('error', {
        title: 'Min tutors required',
        description: 'Enter at least 1 tutor for the start of this bracket.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (isUpdate && tier) {
        await updateAcademicLeaderBonusTier(tier.id, values)
      } else {
        await createAcademicLeaderBonusTier(leaderId, values)
      }
      await queryClient.invalidateQueries({
        queryKey: academicLeaderBonusQueryKeys.all,
      })
      notify('success', {
        title: isUpdate ? 'Bonus bracket updated' : 'Bonus bracket added',
        description: `${leaderName}'s bonus uses it from the next pay calculation.`,
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', {
        title: isUpdate ? 'Unable to update bracket' : 'Unable to add bracket',
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
          <div className="bg-gradient-to-br from-brand-50 via-white to-white px-6 pt-6 pb-2">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm">
              <Users className="size-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle>
                {isUpdate ? 'Edit bonus bracket' : 'Add bonus bracket'}
              </DialogTitle>
              <DialogDescription>
                By how many of {leaderName}’s tutors earned a session bonus in
                the period.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="leader-bonus-min">
                  Min tutors<span className="text-rose-500"> *</span>
                </Label>
                <Input
                  id="leader-bonus-min"
                  inputMode="numeric"
                  value={values.minHeadcount}
                  onChange={(event) => setField('minHeadcount', event.target.value)}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leader-bonus-max">Max tutors</Label>
                <Input
                  id="leader-bonus-max"
                  inputMode="numeric"
                  value={values.maxHeadcount}
                  onChange={(event) => setField('maxHeadcount', event.target.value)}
                  placeholder="Blank = no max"
                />
                <p className="text-xs text-slate-500">Leave empty for the top bracket.</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leader-bonus-amount">Bonus amount</Label>
              <CurrencyInput
                id="leader-bonus-amount"
                value={values.bonusAmount}
                onValueChange={(digits) => setField('bonusAmount', digits)}
              />
              <p className="text-xs text-slate-500">
                Paid on top of the academic leader’s base salary for the period.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-0 bg-canvas/70 px-6 py-4">
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
              <Users className="size-3.5" />
              {isSubmitting ? 'Saving...' : isUpdate ? 'Save changes' : 'Add bracket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
