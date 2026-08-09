import { Wallet } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { getApiErrorMessage } from '../../../shared/api/errors'
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
  createMarketingSalary,
  marketingSalaryToFormValues,
  updateMarketingSalary,
  type MarketingSalary,
  type MarketingSalaryFormValues,
} from '../api/compensation-api'

type MarketingSalaryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  marketingId: string
  marketingName: string
  salary: MarketingSalary | null
}

export function MarketingSalaryDialog({
  open,
  onOpenChange,
  marketingId,
  marketingName,
  salary,
}: MarketingSalaryDialogProps) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<MarketingSalaryFormValues>({
    mainSalary: '0',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isUpdate = Boolean(salary)

  useEffect(() => {
    if (open) {
      setValues(marketingSalaryToFormValues(salary))
      setIsSubmitting(false)
    }
  }, [open, salary])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      if (salary) {
        await updateMarketingSalary(salary.id, marketingId, values)
      } else {
        await createMarketingSalary(marketingId, values)
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['marketing-salaries'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['marketings'],
        }),
      ])

      notify('success', {
        title: isUpdate ? 'Salary updated' : 'Salary recorded',
        description: `${marketingName}'s marketing salary has been saved.`,
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', {
        title: isUpdate ? 'Unable to update salary' : 'Unable to record salary',
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
          <div className="bg-[linear-gradient(135deg,#EDF4FF_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9] ring-1 ring-[#BED2F2]">
              <Wallet className="size-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle>
                {isUpdate ? 'Update marketing salary' : 'Record marketing salary'}
              </DialogTitle>
              <DialogDescription>
                Set the main salary for {marketingName}. Bonus tiers remain
                managed separately.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="marketing-main-salary">Main salary</Label>
              <Input
                id="marketing-main-salary"
                inputMode="numeric"
                value={values.mainSalary}
                onChange={(event) =>
                  setValues({ mainSalary: event.target.value })
                }
                placeholder="0"
              />
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
              <Wallet className="size-3.5" />
              {isSubmitting ? 'Saving...' : isUpdate ? 'Update' : 'Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
