import { Banknote } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'

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
import { notify } from '../../../shared/lib/notify'
import {
  bonusTierToFormValues,
  commissionPeriodLabels,
  createMarketingBonusTier,
  updateMarketingBonusTier,
  type CommissionPeriodType,
  type MarketingBonusTier,
  type MarketingBonusTierFormValues,
} from '../api/compensation-api'
import { marketingBonusTierFormSchema } from '../schema/marketing-bonus-tier-form-schema'

type FormErrors = Partial<Record<keyof MarketingBonusTierFormValues, string>>

type MarketingBonusTierDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  marketingSalaryId: string
  marketingName: string
  periodType: CommissionPeriodType
  tier: MarketingBonusTier | null
}

const emptyValues: MarketingBonusTierFormValues = {
  minAmount: '0',
  maxAmount: '',
  bonusAmount: '0',
}

export function MarketingBonusTierDialog({
  open,
  onOpenChange,
  marketingSalaryId,
  marketingName,
  periodType,
  tier,
}: MarketingBonusTierDialogProps) {
  const queryClient = useQueryClient()
  const [values, setValues] =
    useState<MarketingBonusTierFormValues>(emptyValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isUpdate = Boolean(tier)

  useEffect(() => {
    if (open) {
      setValues(tier ? bonusTierToFormValues(tier) : emptyValues)
      setErrors({})
      setIsSubmitting(false)
    }
  }, [open, tier])

  function setField(
    field: keyof MarketingBonusTierFormValues,
    value: string,
  ) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  function validateForm(nextValues: MarketingBonusTierFormValues) {
    const result = marketingBonusTierFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: FormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof MarketingBonusTierFormValues] =
          issue.message
      }
    }

    setErrors(nextErrors)
    return false
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    if (!validateForm(values)) return

    setIsSubmitting(true)
    try {
      if (tier) {
        await updateMarketingBonusTier(tier.id, values)
      } else {
        await createMarketingBonusTier(
          marketingSalaryId,
          periodType,
          values,
        )
      }

      await queryClient.invalidateQueries({ queryKey: ['marketing-salaries'] })

      notify('success', {
        title: isUpdate ? 'Bonus tier updated' : 'Bonus tier added',
        description: `${marketingName}'s ${commissionPeriodLabels[periodType].toLowerCase()} bonuses have been saved.`,
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
          <div className="bg-[linear-gradient(135deg,#E8EEFF_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1] ring-1 ring-[#C8D4F5]">
              <Banknote className="size-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle>
                {isUpdate ? 'Update bonus tier' : 'Add bonus tier'}
              </DialogTitle>
              <DialogDescription>
                {commissionPeriodLabels[periodType]} flat IDR bonus for{' '}
                {marketingName}. Leave max amount empty for an open-ended top
                tier.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="bonus-min-amount">Min amount</Label>
              <CurrencyInput
                id="bonus-min-amount"
                value={values.minAmount}
                onValueChange={(digits) => setField('minAmount', digits)}
              />
              <FieldError message={errors.minAmount} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus-max-amount">Max amount</Label>
              <CurrencyInput
                id="bonus-max-amount"
                value={values.maxAmount}
                onValueChange={(digits) => setField('maxAmount', digits)}
                placeholder="No limit"
              />
              <FieldError message={errors.maxAmount} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus-amount">Bonus (IDR)</Label>
              <CurrencyInput
                id="bonus-amount"
                value={values.bonusAmount}
                onValueChange={(digits) => setField('bonusAmount', digits)}
              />
              <FieldError message={errors.bonusAmount} />
            </div>
          </div>

          <DialogFooter className="mt-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              <Banknote className="size-3.5" />
              {isSubmitting ? 'Saving...' : isUpdate ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs text-rose-500">{message}</p>
}
